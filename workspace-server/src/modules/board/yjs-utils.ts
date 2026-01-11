import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import { WebSocket } from 'ws';

const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;
const wsReadyStateClosing = 2; // eslint-disable-line
const wsReadyStateClosed = 3; // eslint-disable-line

const docs = new Map<string, WSSharedDoc>();

const messageSync = 0;
const messageAwareness = 1;

class WSSharedDoc extends Y.Doc {
  name: string;
  conns: Map<WebSocket, Set<number>>;
  awareness: awarenessProtocol.Awareness;

  constructor(name: string) {
    super({ gc: true });
    this.name = name;
    this.conns = new Map();
    this.awareness = new awarenessProtocol.Awareness(this);
    this.awareness.setLocalState(null);

    const awarenessChangeHandler = ({ added, updated, removed }: any, origin: any) => {
      const changedClients = added.concat(updated).concat(removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients));
      const buff = encoding.toUint8Array(encoder);

      this.conns.forEach((_, c) => {
        send(this, c, buff);
      });
    };
    this.awareness.on('update', awarenessChangeHandler);

    this.on('update', (update: Uint8Array, origin: any, doc: Y.Doc) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      const buff = encoding.toUint8Array(encoder);

      this.conns.forEach((_, c) => {
        if (origin !== c) {
            send(this, c, buff);
        }
      });
    });
  }
}

const getYDoc = (docname: string, gc = true): WSSharedDoc => {
    let doc = docs.get(docname);
    if (doc === undefined) {
        doc = new WSSharedDoc(docname);
        doc.gc = gc;
        docs.set(docname, doc);
    }
    return doc;
};

const send = (doc: WSSharedDoc, conn: WebSocket, m: Uint8Array) => {
    if (conn.readyState !== wsReadyStateOpen) {
        closeConn(doc, conn);
    }
    try {
        conn.send(m, (err: any) => { if (err != null) closeConn(doc, conn); });
    } catch (e) {
        closeConn(doc, conn);
    }
};

const closeConn = (doc: WSSharedDoc, conn: WebSocket) => {
    if (doc.conns.has(conn)) {
        const controlledIds = doc.conns.get(conn);
        doc.conns.delete(conn);
        if (controlledIds) {
            awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlledIds), null);
        }
        if (doc.conns.size === 0) {
            // persistence logic here if needed
            // docs.delete(doc.name); // keep for now
        }
    }
    conn.close();
};

export const setupWSConnection = (conn: WebSocket, req: any, { docName = req.url!.slice(1), gc = true }: any = {}) => {
    conn.binaryType = 'arraybuffer';
    const doc = getYDoc(docName, gc);
    doc.conns.set(conn, new Set());

    // Listen to messages
    conn.on('message', (message: ArrayBuffer) => {
        try {
            const encoder = encoding.createEncoder();
            const decoder = decoding.createDecoder(new Uint8Array(message));
            const messageType = decoding.readVarUint(decoder);

            switch (messageType) {
                case messageSync:
                    encoding.writeVarUint(encoder, messageSync);
                    syncProtocol.readSyncMessage(decoder, encoder, doc, null);
                    if (encoding.length(encoder) > 1) {
                        send(doc, conn, encoding.toUint8Array(encoder));
                    }
                    break;
                case messageAwareness: {
                    awarenessProtocol.applyAwarenessUpdate(doc.awareness, decoding.readVarUint8Array(decoder), conn);
                    break;
                }
            }
        } catch (err) {
            console.error(err);
            // doc.emit('error', [err]); // Y.Doc doesn't have error event
        }
    });

    conn.on('close', () => {
        closeConn(doc, conn);
    });

    // Send Step 1
    {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.writeSyncStep1(encoder, doc);
        send(doc, conn, encoding.toUint8Array(encoder));

        const awarenessStates = doc.awareness.getStates();
        if (awarenessStates.size > 0) {
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, messageAwareness);
            encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(awarenessStates.keys())));
            send(doc, conn, encoding.toUint8Array(encoder));
        }
    }
};

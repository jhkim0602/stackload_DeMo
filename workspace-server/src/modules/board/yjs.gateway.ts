import { Server } from "http";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "./yjs-utils";

export function setupYjsGateway(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws, req) => {
    // Determine docName from url (e.g. /yjs/project-123)
    // Or query param
    // Standard y-websocket client connects to ws://url/roomname
    // So req.url might be /roomname

    // Check if we want to add auth here
    // const url = new URL(req.url!, `http://${req.headers.host}`);
    // const token = url.searchParams.get('token');
    // if (!validate(token)) ws.close();

    setupWSConnection(ws, req);
  });

  server.on('upgrade', (request, socket, head) => {
    // Only handle upgrades for /yjs path prefix or let direct connection handle it?
    // y-websocket client usually connects to root or specific path.
    // Let's assume we use a specific path prefix for safety if sharing with socket.io
    // But socket.io uses /socket.io, so we can just use anything else.
    // However, to be safe, let's look for headers or path.

    // Simple approach: accepting all non-socket.io upgrades as Yjs for now
    // or specific "/yjs" path.
    // Let's go with permissive for now as y-websocket client default might be root.

    const url = request.url || "";
    if (url.startsWith('/socket.io')) {
        // Let Socket.IO handle it (it attaches its own upgrade listener usually)
        return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  console.log("BOARD: Yjs WebSocket Gateway initialized");
}

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";


const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-muted/20">Loading Excalidraw...</div>
  }
);

interface IdeaBoardProps {
  projectId: string;
}

export function IdeaBoard({ projectId }: IdeaBoardProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const isReceivingRemoteUpdate = useRef(false);

  // Connect to WebSocket
  useEffect(() => {
    // Use the exact port 12393 that the backend is running on
    const ws = new WebSocket("ws://localhost:12393/client-ws");
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("Whiteboard WS Connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Handle incoming draw updates
        if (data.type === "draw-update" && excalidrawAPI && data.elements) {
           isReceivingRemoteUpdate.current = true;
           excalidrawAPI.updateScene({ elements: data.elements });
           // Reset the flag after the update is processed
           // We use a small timeout to ensure onChange fired by updateScene is ignored
           setTimeout(() => {
               isReceivingRemoteUpdate.current = false;
           }, 50);
        }
      } catch (e) {
        console.error("WS Parse error", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [excalidrawAPI]);

  // Handle local changes
  const handleChange = useCallback((elements: any, appState: any, files: any) => {
      // Prevent echoing back updates we just received
      if (isReceivingRemoteUpdate.current) {
          return;
      }

      // Debounce could be added here for performance
      if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
              type: "draw-update",
              elements: elements
          }));
      }
  }, []);

  return (
    <div className="h-full w-full relative" style={{ height: 'calc(100vh - 4rem)' }}>
       <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          onChange={handleChange}
          theme="light"
       />
    </div>
  );
}

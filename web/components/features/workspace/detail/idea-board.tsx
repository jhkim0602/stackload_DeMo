"use client";

import dynamic from "next/dynamic";
import { useWorkspaceStore } from "../store/mock-data";
import "tldraw/tldraw.css";

// Dynamic import with SSR disabled
const Tldraw = dynamic(async () => (await import("tldraw")).Tldraw, {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-muted/20">Loading Whiteboard...</div>
});

interface IdeaBoardProps {
  projectId: string;
}

export function IdeaBoard({ projectId }: IdeaBoardProps) {
  return (
    <div className="h-full w-full relative" style={{ height: 'calc(100vh - 4rem)' }}>
       <Tldraw persistenceKey={`tldraw-${projectId}`} />
    </div>
  );
}

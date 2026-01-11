"use client";

import { useState, useEffect } from "react";
import { useWorkspaceStore } from "../../store/mock-data";
import { LiveKitRoom, RoomAudioRenderer, StartAudio, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { DndContext, useDraggable, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Maximize2, Minimize2, Video, X, Move } from "lucide-react";

interface GlobalHuddleSidebarProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  viewMode: 'full' | 'pip';
  onViewModeChange: (mode: 'full' | 'pip') => void;
}

export function GlobalHuddleSidebar({ projectId, isOpen, onClose, viewMode, onViewModeChange }: GlobalHuddleSidebarProps) {
  const { projects } = useWorkspaceStore();
  const project = projects.find(p => p.id === projectId);

  const [token, setToken] = useState("");
  const [shouldConnect, setShouldConnect] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Position state for PIP
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Reset state when project changes or closed
  useEffect(() => {
    if (!isOpen) {
      setShouldConnect(false);
      setToken("");
    }
  }, [isOpen]);

  // State for visual debugging
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");

  const handleJoin = async () => {
    try {
      setConnectionStatus("Fetching Token...");
      setError(null);
      console.log("[Huddle] Fetching token for:", projectId);
      // Fetch Token
      const response = await fetch('/api/livekit/token/huddle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: projectId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Huddle] Error response:", errorData);
        if (response.status === 401) throw new Error("Unauthorized: Please log in.");
        if (response.status === 403) throw new Error("Forbidden: Not a member of this project.");
        throw new Error(errorData.error || "Failed to join huddle.");
      }

      const data = await response.json();
      console.log("[Huddle] Token received:", data.token ? "Yes" : "No");

      if (!data.token) {
        throw new Error("No token received from server");
      }

      setToken(data.token);
      setConnectionStatus("Connecting to LiveKit...");
      setShouldConnect(true);
      onViewModeChange('full');
    } catch (err: any) {
      console.error("[Huddle] Join Error:", err);
      setError(err.message || "Failed to connect");
      setConnectionStatus("Error: " + err.message);
    }
  };

  const handleRoomDisconnected = () => {
    setError("LiveKit 연결이 끊겼어요. 다시 시도해주세요.");
    setConnectionStatus("Disconnected");
    setShouldConnect(false);
    setToken("");
  };

  const handleUserClose = () => {
    setShouldConnect(false);
    onClose();
  };

  if (!isOpen) return null;

  // 1. Pre-Join Modal
  if (!shouldConnect || !token) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center space-y-6">
                <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                    <Video className="h-10 w-10 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Join Team Huddle</h2>
                    <p className="text-slate-500 mt-2">Ready to join the voice channel for {project?.title}?</p>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                <div className="flex flex-col gap-3">
                    <button onClick={handleJoin} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all">
                        Join Now
                    </button>
                    <button onClick={onClose} className="w-full text-slate-500 hover:bg-slate-100 py-3 rounded-xl font-medium transition-all">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
  }

    // 2. Connected State (Single LiveKitRoom Instance)
    console.log("[Huddle] Rendering Room. URL:", process.env.NEXT_PUBLIC_LIVEKIT_URL, "Connect:", shouldConnect);

  return (
    <>
      {/* Debug Overlay */}
      {viewMode === 'full' && (
        <div className="fixed top-20 right-4 z-50 bg-black/80 text-white p-2 rounded text-xs pointer-events-none">
          Status: <span className={connectionStatus === 'Connected' ? 'text-green-400' : 'text-yellow-400'}>{connectionStatus}</span>
        </div>
      )}

      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL_WORKSPACE}
        connect={shouldConnect}
        onConnected={() => {
            console.log("[Huddle] Connected!");
            setConnectionStatus("Connected");
        }}
        onDisconnected={handleRoomDisconnected}
        onError={(err) => {
            console.error("[Huddle] LiveKit Error:", err);
            setConnectionStatus("Error: " + err.message);
        }}
        data-lk-theme="default"
        className="h-full w-full"
      >
       {/*
          We render the specific VIEW based on viewMode here.
          Important: The LiveKitRoom context remains active.
       */}
       <HuddleLayoutRenderer
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          onClose={handleUserClose}
          position={position}
          onPositionChange={setPosition}
       />
       <RoomAudioRenderer />
       <StartAudio label="Click to allow audio playback" />
    </LiveKitRoom>
    </>
  );
}

// Sub-component to handle layout switching without unmounting Room Context
function HuddleLayoutRenderer({ viewMode, onViewModeChange, onClose, position, onPositionChange }: any) {

  if (viewMode === 'full') {
    return (
        <div className="fixed top-16 right-0 bottom-0 left-64 z-40 flex flex-col bg-background text-foreground animate-in fade-in duration-200 pointer-events-auto border-l border-t border-border/50">
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-border/50 bg-muted/30">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">Huddle</span>
                    <span className="bg-green-500/20 text-green-600 text-xs px-2 py-0.5 rounded-full border border-green-500/30">Live</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onViewModeChange('pip')}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                        title="Minimize to PIP"
                    >
                        <Minimize2 className="h-5 w-5" />
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-red-500/10 text-red-500 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Main Conference View */}
            <div className="flex-1 relative">
                <VideoConference />
            </div>
        </div>
    );
  }

  // PIP Mode
  return (
      <DraggablePipOverlay
          position={position}
          onPositionChange={onPositionChange}
          onExpand={() => onViewModeChange('full')}
          onClose={onClose}
      >
          {/* Simplified View for PIP: Just VideoConference with hidden controls or custom Grid */}
          <div className="h-full w-full pointer-events-auto overflow-hidden rounded-xl">
             <VideoConference
                chatMessageFormatter={() => ""} // Hide chat in PIP
                className="h-full w-full"
             />
          </div>
      </DraggablePipOverlay>
  );
}

// Separate Component for Draggable Logic
function DraggablePipOverlay({ children, position, onPositionChange, onExpand, onClose }: any) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  return (
    <DndContext
        sensors={sensors}
        onDragEnd={(event) => {
            const { delta } = event;
            onPositionChange((prev: any) => ({
                x: prev.x + delta.x,
                y: prev.y + delta.y
            }));
        }}
    >
        <DraggableBox
            x={position.x}
            y={position.y}
            onExpand={onExpand}
            onClose={onClose}
        >
            {children}
        </DraggableBox>
    </DndContext>
  );
}

function DraggableBox({ children, x, y, onExpand, onClose }: any) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: 'pip-window',
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        left: `calc(100vw - 380px + ${x}px)`,
        top: `calc(100vh - 280px + ${y}px)`,
        position: 'fixed' as const,
        touchAction: 'none',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="w-[340px] h-[240px] bg-slate-900 rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col z-50 group pointer-events-auto"
        >
            {/* Drag Handle */}
            <div
                {...listeners}
                {...attributes}
                className="h-8 bg-black/40 w-full flex items-center justify-between px-3 cursor-move hover:bg-black/60 transition-colors"
            >
                <div className="flex items-center gap-2 text-white/50 text-xs">
                    <Move className="h-3 w-3" />
                    <span>Huddle</span>
                </div>
                <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
                     <button onClick={onExpand} className="p-1 hover:text-white text-white/60">
                         <Maximize2 className="h-3 w-3" />
                     </button>
                     <button onClick={onClose} className="p-1 hover:text-red-400 text-white/60">
                         <X className="h-3 w-3" />
                     </button>
                </div>
            </div>
            {/* Content */}
            <div className="flex-1 relative overflow-hidden bg-black">
                {children}
            </div>
        </div>
    );
}

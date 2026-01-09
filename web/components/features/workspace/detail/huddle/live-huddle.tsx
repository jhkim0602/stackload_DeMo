"use client";

import { useState } from "react";
import { useWorkspaceStore } from "../../store/mock-data";
import { useSocketStore } from "../../store/socket-store";
import { MeetingRoom } from "@stackload/meeting-sdk";
import { DndContext, useDraggable, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Maximize2, Minimize2, Video, ExternalLink, X, Move } from "lucide-react";

interface GlobalHuddleSidebarProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  // Controlled View Mode
  viewMode: 'full' | 'pip';
  onViewModeChange: (mode: 'full' | 'pip') => void;
}

export function GlobalHuddleSidebar({ projectId, isOpen, onClose, viewMode, onViewModeChange }: GlobalHuddleSidebarProps) {
  const { projects } = useWorkspaceStore();
  const { joinHuddle, leaveHuddle } = useSocketStore();
  const project = projects.find(p => p.id === projectId);

  const [hasJoined, setHasJoined] = useState(false);

  // Mock participants
  const participants = project?.members.slice(0, 4).map(m => ({ id: m.id, name: m.name })) || [];
  const currentUser = { id: 'u1', name: 'Junghwan' };

  // Draggable State for PIP
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleJoin = () => {
      setHasJoined(true);
      onViewModeChange('full'); // Always start in Full Mode
      joinHuddle(projectId, { id: 'u1', name: 'User' });
  };

  const handleClose = () => {
      if (hasJoined) leaveHuddle(projectId);
      setHasJoined(false);
      onViewModeChange('full');
      onClose();
  }

  // If not open, render nothing
  if (!isOpen) return null;

  // -- 1. Pre-Join / Splash Screen (Modal) --
  if (!hasJoined) {
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center space-y-6">
                  <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                      <Video className="h-10 w-10 text-indigo-600" />
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold text-slate-900">Join Huddle</h2>
                      <p className="text-slate-500 mt-2">Ready to join the voice channel for {project?.title}?</p>

                      {/* Active Participants Preview */}
                      <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center justify-center gap-1">
                             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                             {participants.length} Active Participants
                          </div>
                          <div className="flex flex-wrap items-center justify-center gap-2">
                             {participants.length > 0 ? participants.map((p) => (
                                 <div key={p.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                                      <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                                          {p.name.charAt(0)}
                                      </div>
                                      <span className="text-sm font-medium text-slate-700">{p.name}</span>
                                 </div>
                             )) : (
                                 <span className="text-sm text-slate-400 italic">No one is here yet. Be the first!</span>
                             )}
                          </div>
                      </div>
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

  // -- 2. Full Screen Mode (Zoom/Discord Style - Native Integration) --
  if (viewMode === 'full') {
      return (
          // Adjusted to start after the 64px Header and 256px Sidebar
          // Theme-aware background: bg-background (adapts to light/dark)
          <div className="fixed top-16 right-0 bottom-0 left-64 z-40 flex flex-col bg-background text-foreground animate-in fade-in duration-200 rounded-tl-2xl overflow-hidden shadow-2xl border-l border-t border-border/50">
              {/* Header - now part of the content view, essentially a sub-header */}
              <div className="h-14 flex items-center justify-between px-6 border-b border-border/50 bg-muted/30">
                  <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">Huddle</span>
                      <span className="bg-green-500/20 text-green-600 dark:text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30">Live</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <button
                          onClick={() => onViewModeChange('pip')}
                          className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                          title="Minimize to PIP"
                      >
                          <Minimize2 className="h-5 w-5" />
                      </button>
                      <button onClick={handleClose} className="p-2 hover:bg-red-500/10 text-red-500/80 hover:text-red-500 rounded-full transition-colors">
                          <X className="h-5 w-5" />
                      </button>
                  </div>
              </div>

              {/* Main Video Area */}
              <div className="flex-1 p-0 overflow-hidden relative">
                  <MeetingRoom
                      roomId={projectId}
                      currentUser={currentUser}
                      participants={participants}
                      onClose={handleClose}
                      mode="full"
                  />
              </div>
          </div>
      );
  }

  // -- 3. PIP Mode (Draggable) --
  return (
      <DraggablePipOverlay
          position={position}
          onPositionChange={setPosition}
          onExpand={() => onViewModeChange('full')}
          onClose={handleClose}
      >
           <MeetingRoom
              roomId={projectId}
              currentUser={currentUser}
              participants={participants}
              onClose={handleClose}
              mode="sidebar" // Reusing sidebar mode for simplified grid
           />
      </DraggablePipOverlay>
  );
}

// Separate Component for Draggable Logic cleanly
function DraggablePipOverlay({ children, position, onPositionChange, onExpand, onClose }: any) {
  // We need a stable ID for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevent accidental drags on click
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
        left: `calc(100vw - 380px + ${x}px)`, // Initial position bottom-rightish
        top: `calc(100vh - 280px + ${y}px)`,
        position: 'fixed' as const,
        touchAction: 'none',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="w-[340px] h-[240px] bg-slate-900 rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col z-50 group"
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
            <div className="flex-1 relative pointer-events-auto">
                {children}
            </div>
        </div>
    );
}

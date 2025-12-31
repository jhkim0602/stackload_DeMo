"use client";

import { useLocalParticipant, useMediaDeviceSelect, VideoTrack, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { User, VideoOff } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface UserVideoProps {
  className?: string;
}

export function UserVideo({ className }: UserVideoProps) {
  const { isCameraEnabled } = useLocalParticipant();
  // Use useTracks to get the partial track reference which contains publication + participant + source
  const tracks = useTracks([Track.Source.Camera]);
  const cameraTrack = tracks.find(t => t.source === Track.Source.Camera);

  return (
    <div className={cn("relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl", className)}>
      {/* Video Feed */}
      {isCameraEnabled && cameraTrack ? (
          <VideoTrack
            trackRef={cameraTrack}
            className="w-full h-full object-cover mirror-mode" // mirror-mode for self-view
          />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/50">
          <div className="p-6 rounded-full bg-slate-800 mb-4">
             <VideoOff className="w-12 h-12 text-slate-500" />
          </div>
          <p className="text-slate-400 font-medium">카메라가 꺼져있습니다</p>
        </div>
      )}

      {/* User Label Badge */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white text-sm font-medium">
         <User className="w-4 h-4" />
         <span>나 (지원자)</span>
      </div>
    </div>
  );
}

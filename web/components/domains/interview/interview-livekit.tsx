"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";
import Live2DPlayer from "@/components/domains/interview/live2d-player";
import { UserVideo } from "@/components/domains/interview/user-video";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function InterviewLiveKit() {
  const [token, setToken] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit/token?room=interview-room-${Math.random()
            .toString(36)
            .substring(7)}&username=candidate`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  if (token === "") {
    return (
        <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
            <div className="space-y-4 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">면접장 입장 중...</p>
            </div>
        </div>
    );
  }

  return (
    <LiveKitRoom
      video={true} // Enable video for user camera
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
      data-lk-theme="default"
      style={{ height: "100%" }}
    >
      <RoomAudioRenderer />
      <InterviewInterface />
    </LiveKitRoom>
  );
}

function InterviewInterface() {
  const { isMicrophoneEnabled, isCameraEnabled, localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const router = useRouter();

  // Auto-enable microphone and camera on mount
  useEffect(() => {
    if (localParticipant) {
        localParticipant.setMicrophoneEnabled(true);
        localParticipant.setCameraEnabled(true);
    }
  }, [localParticipant]);

  // TODO: Use real agent audio track for lip-sync in the future
  const isAgentSpeaking = false;

  const toggleMic = async () => {
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    }
  };

  const toggleCam = async () => {
    if (localParticipant) {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    }
  };

  const handleDisconnect = async () => {
    if (room) {
        await room.disconnect();
    }
    router.push('/interview');
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 p-4 md:p-6 gap-4 md:gap-6">
      {/* Main Content Area: Split View */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 min-h-0">

        {/* Left: AI Interviewer */}
        <div className="relative h-full w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Header Badge */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-blue-600/90 backdrop-blur-md rounded-lg text-white text-sm font-semibold shadow-lg">
                AI 면접관 TechMoa
            </div>

            {/* Live2D Avatar */}
            <div className="flex-1 relative flex items-center justify-center">
                <Live2DPlayer
                    modelUrl="/live2d/mao_pro/runtime/mao_pro.model3.json"
                    isSpeaking={isAgentSpeaking}
                    className="w-full h-full object-contain scale-110 md:scale-125 translate-y-10" // Slight zoom/adjustment
                />
            </div>

             {/* Status Indicator (Optional) */}
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-700/50 flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", isAgentSpeaking ? "bg-green-500 animate-pulse" : "bg-slate-500")} />
                <span className="text-xs font-medium text-slate-300">
                    {isAgentSpeaking ? "말하는 중..." : "듣는 중"}
                </span>
             </div>
        </div>

        {/* Right: User Camera (Candidate) */}
        <div className="relative h-full w-full">
            <UserVideo />
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="h-20 shrink-0 flex items-center justify-center gap-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl px-8 shadow-2xl">

        {/* Mic Toggle */}
        <ControlButton
            onClick={toggleMic}
            isActive={isMicrophoneEnabled}
            activeIcon={<Mic />}
            inactiveIcon={<MicOff />}
        />

        {/* Camera Toggle */}
        <ControlButton
            onClick={toggleCam}
            isActive={isCameraEnabled}
            activeIcon={<Video />}
            inactiveIcon={<VideoOff />}
        />

         {/* Separator */}
         <div className="w-px h-8 bg-slate-800 mx-2" />

        {/* Adjust settings (Placeholder) */}
        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <Settings className="w-6 h-6" />
        </Button>

         {/* End Interview Button */}
        <Button
            variant="destructive"
            size="lg"
            className="h-12 px-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-red-900/20"
            onClick={handleDisconnect}
        >
            <PhoneOff className="w-5 h-5 mr-2" />
            면접 종료
        </Button>
      </div>
    </div>
  );
}

// Helper component for styled controls
function ControlButton({ onClick, isActive, activeIcon, inactiveIcon }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
            "flex flex-col items-center justify-center h-12 w-12 rounded-full transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950",
            isActive
                ? "bg-slate-800 text-white hover:bg-slate-700 ring-1 ring-slate-700"
                : "bg-red-500/10 text-red-500 hover:bg-red-500/20 ring-1 ring-red-500/30"
        )}>
            <div className="w-5 h-5">
                {isActive ? activeIcon : inactiveIcon}
            </div>
        </button>
    );
}

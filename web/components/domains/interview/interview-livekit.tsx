"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";
import Live2DPlayer from "@/components/domains/interview/live2d-player";
import MicControls from "./mic-controls";

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
    return <div>Getting token...</div>;
  }

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      // Use the new LiveKit Agents protocol for connecting to the backend agent
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
  const { isMicrophoneEnabled } = useLocalParticipant();
  // TODO: We need to analyze the incoming audio track from the agent to drive lip sync
  // For now, we will pass a placeholder isSpeaking
  const isAgentSpeaking = false;

  return (
    <div className="flex flex-col h-full w-full relative">
       <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
            <Live2DPlayer
                modelUrl="/live2d/mao_pro/runtime/mao_pro.model3.json" // Corrected path
                isSpeaking={isAgentSpeaking}
                className="w-full h-full object-contain"
            />
       </div>

       <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        {/* We need to implement MicControls */}
       </div>
    </div>
  );
}

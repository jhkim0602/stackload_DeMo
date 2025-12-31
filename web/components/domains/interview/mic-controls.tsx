"use client";

import { useLocalParticipant } from "@livekit/components-react";
import { Mic, MicOff } from "lucide-react";

export default function MicControls() {
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();

  const toggleMic = async () => {
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    }
  };

  return (
    <button
      onClick={toggleMic}
      className={`p-4 rounded-full transition-colors ${
        isMicrophoneEnabled
          ? "bg-white text-black hover:bg-gray-200"
          : "bg-red-500 text-white hover:bg-red-600"
      }`}
    >
      {isMicrophoneEnabled ? <Mic size={24} /> : <MicOff size={24} />}
    </button>
  );
}

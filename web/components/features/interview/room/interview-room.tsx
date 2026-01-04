
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, PhoneOff, PlugZap } from "lucide-react";
import { useOpenLLM } from "@/hooks/use-open-llm";
import dynamic from "next/dynamic";

// Dynamically import Live2DPlayer to avoid SSR issues with PIXI
const Live2DPlayer = dynamic(() => import("./live2d-player"), {
  ssr: false,
  loading: () => <div className="text-white">Loading Avatar...</div>
});

export function InterviewRoom() {
  const {
    connect,
    disconnect,
    startMic,
    stopMic,
    isConnected,
    isMicOn,
    isAIProcessing,
    isAISpeaking,
    volume
  } = useOpenLLM();

  const MODEL_URL = "http://localhost:12393/live2d-models/mao_pro/runtime/mao_pro.model3.json";

  // Auto connect on mount (optional, or user trigger)
  // useEffect(() => { connect(); return () => disconnect(); }, []);

  const toggleConnection = () => {
    if (isConnected) {
        disconnect();
    } else {
        connect();
    }
  };

  const toggleMic = () => {
      if (isMicOn) stopMic();
      else startMic();
  };

  return (
    <div className="flex flex-col md:flex-row h-full flex-1 p-4 gap-4 bg-muted/30">

      {/* Main Avatar / Video Area */}
      <Card className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {isConnected ? (
           <Live2DPlayer
              modelUrl={MODEL_URL}
              isSpeaking={isAISpeaking}
              className="w-full h-full object-contain"
           />
        ) : (
            /* Placeholder for Avatar when offline */
            <div className="text-center text-white/50 space-y-4">
              <div className="w-40 h-40 rounded-full mx-auto flex items-center justify-center bg-indigo-500/20">
                 <span className="text-6xl">🤖</span>
              </div>
              <p className="text-lg">Ready to Connect</p>

              <Button onClick={toggleConnection} variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                   <PlugZap className="mr-2 h-4 w-4"/> Connect to Server
              </Button>
            </div>
        )}

        {/* Status Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {isConnected ? '● Online' : '○ Offline'}
           </span>
        </div>

        {/* Volume Indicator (Visual only) */}
        {isMicOn && (
             <div className="absolute bottom-4 right-4 h-32 w-4 bg-gray-800 rounded-full overflow-hidden">
                 <div className="bg-green-500 w-full absolute bottom-0 transition-all duration-75" style={{ height: `${volume * 100}%` }}></div>
             </div>
        )}
      </Card>

      {/* Control / Chat Side Panel */}
      <Card className="w-full md:w-80 flex flex-col p-4 bg-background">
        <div className="flex-1 overflow-y-auto mb-4 border rounded-md p-2 bg-muted/10">
          <p className="text-sm text-muted-foreground text-center mt-10">transcripts will appear here...</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
           <Button
             variant={isMicOn ? "default" : "secondary"}
             size="icon"
             onClick={toggleMic}
             disabled={!isConnected}
             className={`w-full ${isMicOn ? "bg-red-500 hover:bg-red-600" : ""}`}
           >
             {isMicOn ? <MicOff /> : <Mic />}
           </Button>
           <Button variant="secondary" size="icon" className="w-full" disabled>
             <Video />
           </Button>
           <Button variant="destructive" size="icon" onClick={disconnect} disabled={!isConnected} className="w-full">
             <PhoneOff />
           </Button>
        </div>
      </Card>
    </div>
  );
}

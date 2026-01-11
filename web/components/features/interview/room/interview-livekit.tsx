"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState, useRef, useCallback } from "react";
import Live2DPlayer from "@/components/features/interview/room/live2d-player";
import { UserVideo } from "@/components/features/interview/room/user-video";
import { NonVerbalAnalyzer } from "@/components/features/interview/room/non-verbal-analyzer";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useInterviewSession } from "@/hooks/use-interview-session";

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
      video={false}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL_INTERVIEW}
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
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const router = useRouter();

  // Local Video State
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);
  const [isLocalCameraEnabled, setIsLocalCameraEnabled] = useState(true);

  // Audio Processing Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

  // Audio Processing Logic for Agent Speech (TTS)
  const processAudioQueue = useCallback(() => {
      if (!audioContextRef.current) return;

      if (audioQueueRef.current.length === 0) {
          isPlayingRef.current = false;
          setIsAgentSpeaking(false);
          return;
      }

      isPlayingRef.current = true;
      setIsAgentSpeaking(true);

      const chunk = audioQueueRef.current.shift();
      if (!chunk) return;

      const buffer = audioContextRef.current.createBuffer(1, chunk.length, 24000);
      buffer.getChannelData(0).set(chunk);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);

      source.onended = () => {
          processAudioQueue();
      };
      source.start();
  }, []);

  const handleAudioData = useCallback((audioData: any) => {
      // Initialize AudioContext on first audio packet if needed
      if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioContextClass();
      }

      // audioData comes as regular array from hook, convert to Float32Array
      audioQueueRef.current.push(new Float32Array(audioData));

      if (!isPlayingRef.current) {
          processAudioQueue();
      }
  }, [processAudioQueue]);

  // Use Custom Hook
  const { state, startSession, sendUserAudio, sendBehaviorData } = useInterviewSession({
      url: `ws://127.0.0.1:12393/client-ws`,
      onAudioData: handleAudioData
  });

  // Start Session on Mount
  useEffect(() => {
      const stored = sessionStorage.getItem("interviewData");
      if (stored && state.isConnected && state.phase === 'initial') {
          const data = JSON.parse(stored);
          startSession(data.jdUrl || "General JD", data.resumeText || "Candidate");
      }
  }, [state.isConnected, state.phase, startSession]);


  // Auto-enable microphone on mount
  useEffect(() => {
    if (localParticipant) {
        localParticipant.setMicrophoneEnabled(true);
    }
  }, [localParticipant]);

  // Local Video Initialization
  useEffect(() => {
      const initCamera = async () => {
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              setLocalVideoStream(stream);
          } catch (e) {
              console.error("Failed to acquire local camera:", e);
              setIsLocalCameraEnabled(false);
          }
      };
      initCamera();
      return () => {
          // Cleanup handled by stream tracks logic usually
      };
  }, []);

  // Sync local camera state
  useEffect(() => {
     if (localVideoStream) {
         localVideoStream.getVideoTracks().forEach(track => {
             track.enabled = isLocalCameraEnabled;
         });
     }
  }, [localVideoStream, isLocalCameraEnabled]);


  // Capture User Audio (Microphone) -> Backend
  useEffect(() => {
    if (!isMicrophoneEnabled || !localParticipant) return;

    let localCtx: AudioContext | null = null;
    let localProcessor: ScriptProcessorNode | null = null;
    let localSource: MediaStreamAudioSourceNode | null = null;

    const startCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass({ sampleRate: 16000 });
            localCtx = ctx;

            const source = ctx.createMediaStreamSource(stream);
            localSource = source;
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            localProcessor = processor;

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                // Send raw float32 array via hook
                sendUserAudio(inputData);
            };

            source.connect(processor);
            processor.connect(ctx.destination);
        } catch (err) {
            console.error("Microphone capture error:", err);
        }
    };

    startCapture();

    return () => {
         localProcessor?.disconnect();
         localSource?.disconnect();
         localCtx?.close();
    };
  }, [isMicrophoneEnabled, localParticipant, sendUserAudio]);


  const toggleMic = async () => {
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    }
  };

  const toggleCam = () => {
    setIsLocalCameraEnabled(prev => !prev);
  };

  const handleDisconnect = async () => {
    if (room) await room.disconnect();
    if (localVideoStream) localVideoStream.getTracks().forEach(t => t.stop());

    if (state.clientUid) {
        router.push(`/interview/result?uid=${state.clientUid}`);
    } else {
        router.push('/interview');
    }
  };

  // UI Construction matches previous logic but uses 'state' from hook
  return (
    <div className="flex flex-col h-full w-full bg-slate-950 p-4 md:p-6 gap-4 md:gap-6">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 min-h-0">
        <div className="relative h-full w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Header Badge */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className="px-3 py-1.5 bg-blue-600/90 backdrop-blur-md rounded-lg text-white text-sm font-semibold shadow-lg">
                    AI 면접관 TechMoa
                </div>
                 {state.backendPhase && (
                   <div className="px-3 py-1.5 bg-slate-700/80 backdrop-blur-md rounded-lg text-white text-sm font-medium shadow-lg border border-slate-600">
                       {state.backendPhase === 'introduction' && '자기소개'}
                       {state.backendPhase === 'technical' && '기술면접'}
                       {state.backendPhase === 'behavioral' && '인성면접'}
                       {state.backendPhase === 'closing' && '마무리'}
                       {!['introduction', 'technical', 'behavioral', 'closing'].includes(state.backendPhase) && state.backendPhase}
                   </div>
                 )}
            </div>

            {/* Guide Message */}
            {(state.systemGuide || state.statusMessage) && (
                <div className="absolute top-16 left-4 right-4 z-10 animate-in slide-in-from-top-2 fade-in duration-500">
                    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-200 px-4 py-3 rounded-xl shadow-xl flex items-start gap-3">
                         <div className="p-1 bg-blue-500/20 rounded-full mt-0.5">
                            <span className="text-blue-400 text-xs font-bold px-1.5">Guide</span>
                         </div>
                         <p className="text-sm leading-relaxed">{state.systemGuide || state.statusMessage}</p>
                    </div>
                </div>
            )}

            {/* Live2D Avatar */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                <Live2DPlayer
                    modelUrl="/live2d/mao_pro/runtime/mao_pro.model3.json"
                    isSpeaking={isAgentSpeaking}
                    className="w-full h-full"
                />
            </div>

             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-700/50 flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", isAgentSpeaking ? "bg-green-500 animate-pulse" : "bg-slate-500")} />
                <span className="text-xs font-medium text-slate-300">
                    {isAgentSpeaking ? "말하는 중..." : "듣는 중"}
                </span>
             </div>
        </div>

        <div className="relative h-full w-full">
            <UserVideo
                localStream={localVideoStream}
                isCameraEnabled={isLocalCameraEnabled}
            />
            <NonVerbalAnalyzer
                debug={true}
                localStream={localVideoStream}
                onData={sendBehaviorData}
            />
        </div>
      </div>

      <div className="h-20 shrink-0 flex items-center justify-center gap-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl px-8 shadow-2xl">
        <ControlButton
            onClick={toggleMic}
            isActive={isMicrophoneEnabled}
            activeIcon={<Mic />}
            inactiveIcon={<MicOff />}
        />
        <ControlButton
            onClick={toggleCam}
            isActive={isLocalCameraEnabled}
            activeIcon={<Video />}
            inactiveIcon={<VideoOff />}
        />
         <div className="w-px h-8 bg-slate-800 mx-2" />
        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <Settings className="w-6 h-6" />
        </Button>
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

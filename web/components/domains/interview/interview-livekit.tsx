"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { useEffect, useState, useRef, useCallback } from "react";
import Live2DPlayer from "@/components/domains/interview/live2d-player";
import { UserVideo } from "@/components/domains/interview/user-video";
import { NonVerbalAnalyzer } from "@/components/domains/interview/non-verbal-analyzer";
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
      video={false} // Disable LiveKit video publishing (Local only)
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
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const router = useRouter();

  // State
  const [isAgentSpeakingState, setIsAgentSpeakingState] = useState(false);
  const isAgentSpeaking = isAgentSpeakingState;
  const [interviewPhase, setInterviewPhase] = useState<string>("");
  const [guideText, setGuideText] = useState<string>("");

  // Local Video State
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);
  const [isLocalCameraEnabled, setIsLocalCameraEnabled] = useState(true);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);

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
          // Cleanup tracks on unmount is tricky if we want to toggle.
          // But for now, let's keep it simple.
          // Note: We don't stop tracks here directly to allow re-renders,
          // but strictly speaking we should if component unmounts.
      };
  }, []);

  // Update enable/disable state of local tracks
  useEffect(() => {
     if (localVideoStream) {
         localVideoStream.getVideoTracks().forEach(track => {
             track.enabled = isLocalCameraEnabled;
         });
     }
  }, [localVideoStream, isLocalCameraEnabled]);

  // Initialize AudioContext (Output) for agent audio playback
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
    }
    return () => {
        audioContextRef.current?.close();
    };
  }, []);

  // Audio Playback Logic for agent audio
  const playNextAudioChunk = useCallback(() => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) {
        isPlayingRef.current = false;
        setIsAgentSpeakingState(false);
        return;
    }

    isPlayingRef.current = true;
    setIsAgentSpeakingState(true);

    const chunk = audioQueueRef.current.shift();
    if (!chunk) return;

    const buffer = audioContextRef.current.createBuffer(1, chunk.length, 24000); // Assuming 24kHz from backend
    buffer.getChannelData(0).set(chunk);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);

    source.onended = () => {
        playNextAudioChunk();
    };

    source.start();
  }, [audioContextRef, audioQueueRef, isPlayingRef, setIsAgentSpeakingState]);

  const queueAudio = useCallback((audioData: number[]) => {
    audioQueueRef.current.push(new Float32Array(audioData));
    if (!isPlayingRef.current) {
        playNextAudioChunk();
    }
  }, [audioQueueRef, isPlayingRef, playNextAudioChunk]);

  // WebSocket Connection to backend
  useEffect(() => {
    const backendPort = 12393; // Matches conf.default.yaml
    const wsUrl = `ws://127.0.0.1:${backendPort}/client-ws`;

    console.log("Connecting to backend WS:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
        console.log("Backend WS connected");

        // Retrieve data from sessionStorage
        const stored = sessionStorage.getItem("interviewData");
        if (stored) {
            const data = JSON.parse(stored);
            console.log("Found session data, initializing interview...", data);

            // Send initialization request to backend
            ws.send(JSON.stringify({
                type: 'init-interview-session',
                jd: data.jdUrl, // Backend expects 'jd' (text or url). Currently passing URL as text.
                resume: data.resumeText,
                style: data.personality || 'professional'
            }));
        } else {
            console.warn("No session data found in storage.");
        }
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            if (data.type === 'control') {
                if (data.text) setInterviewPhase(data.text);
                if (data.guide) setGuideText(data.guide);
            } else if (data.type === 'status') {
                setGuideText(data.message);
            } else if (data.type === 'interview-session-created') {
                console.log("Interview session ready:", data);
                setGuideText(data.message || "면접 준비 완료. 시작합니다.");
            } else if (data.type === 'audio') {
                // Handle Audio Chunk
                if (data.audio) {
                     queueAudio(data.audio);
                }
            } else if (data.type === 'full-text') {
                 // Should ideally show subtitles
                 console.log("Agent:", data.text);
            }
        } catch (e) {
            // Ignore non-JSON messages
        }
    };

    ws.onerror = (err) => {
        console.error("Backend WS error", err);
    };

    return () => {
        ws.close();
    };
  }, [queueAudio, setInterviewPhase, setGuideText]); // Dependencies for callbacks and state setters

  // Microphone Audio Capture & Transmission
  useEffect(() => {
    if (!isMicrophoneEnabled || !localParticipant) return;

    let localStream: MediaStream | null = null;
    let localProcessor: ScriptProcessorNode | null = null;
    let localCtx: AudioContext | null = null;

    const startCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStream = stream;
            mediaStreamRef.current = stream;

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass({ sampleRate: 16000 }); // Downsample to 16kHz for backend
            localCtx = ctx;
            inputContextRef.current = ctx;

            const source = ctx.createMediaStreamSource(stream);
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            localProcessor = processor;
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    const inputData = e.inputBuffer.getChannelData(0);
                    // Downsample or send as is (ctx is already 16k)
                    // Convert Float32Array to regular array for JSON
                    const audioData = Array.from(inputData);

                    // Simple VAD/Threshold check to reduce bandwidth (Optional)
                    // For now send all to let backend VAD handle it
                    wsRef.current.send(JSON.stringify({
                        type: 'mic-audio-data',
                        audio: audioData
                    }));
                }
            };

            source.connect(processor);
            processor.connect(ctx.destination); // Required for script processor to run
        } catch (err) {
            console.error("Microphone capture error:", err);
        }
    };

    startCapture();

    return () => {
         if (localProcessor) {
             localProcessor.disconnect();
         }
         if (localCtx) {
             localCtx.close();
         }
         if (localStream) {
             localStream.getTracks().forEach(track => track.stop());
         }
    };
  }, [isMicrophoneEnabled, localParticipant, wsRef]); // Re-run when mic is toggled or wsRef changes

  const toggleMic = async () => {
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    }
  };

  const toggleCam = () => {
    setIsLocalCameraEnabled(prev => !prev);
  };

  const handleDisconnect = async () => {
    if (room) {
        await room.disconnect();
    }
    // Also stop local stream
    if (localVideoStream) {
        localVideoStream.getTracks().forEach(t => t.stop());
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
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className="px-3 py-1.5 bg-blue-600/90 backdrop-blur-md rounded-lg text-white text-sm font-semibold shadow-lg">
                    AI 면접관 TechMoa
                </div>
                {interviewPhase && (
                   <div className="px-3 py-1.5 bg-slate-700/80 backdrop-blur-md rounded-lg text-white text-sm font-medium shadow-lg border border-slate-600">
                       {interviewPhase === 'introduction' && '자기소개'}
                       {interviewPhase === 'technical' && '기술면접'}
                       {interviewPhase === 'behavioral' && '인성면접'}
                       {interviewPhase === 'closing' && '마무리'}
                       {!['introduction', 'technical', 'behavioral', 'closing'].includes(interviewPhase) && interviewPhase}
                   </div>
                )}
            </div>

            {/* Guide Message Toast/Banner */}
            {guideText && (
                <div className="absolute top-16 left-4 right-4 z-10 animate-in slide-in-from-top-2 fade-in duration-500">
                    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-200 px-4 py-3 rounded-xl shadow-xl flex items-start gap-3">
                         <div className="p-1 bg-blue-500/20 rounded-full mt-0.5">
                            <span className="text-blue-400 text-xs font-bold px-1.5">Guide</span>
                         </div>
                         <p className="text-sm leading-relaxed">{guideText}</p>
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
            <UserVideo
                localStream={localVideoStream}
                isCameraEnabled={isLocalCameraEnabled}
            />
            <NonVerbalAnalyzer
                debug={true}
                localStream={localVideoStream}
                onData={(data) => {
                    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({
                            type: 'behavior-data',
                            data: data
                        }));
                    }
                }}
            />
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
            isActive={isLocalCameraEnabled}
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

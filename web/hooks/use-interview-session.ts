import { useState, useEffect, useRef, useCallback } from 'react';

export type InterviewPhase = 'initial' | 'intro' | 'question' | 'listening' | 'thinking' | 'answering' | 'outro';

export interface Message {
    role: 'ai' | 'user' | 'system';
    text: string;
    timestamp: number;
}

interface InterviewState {
  isConnected: boolean;
  phase: InterviewPhase;
  transcript: Message[];
  currentQuestion: string;
  isMicEnabled: boolean;
  statusMessage: string;
  backendPhase: string; // 'introduction' | 'technical' | 'behavioral' | 'closing'
  systemGuide: string;
  clientUid: string | null;
}

interface UseInterviewSessionProps {
    url: string; // WebSocket URL
    onAudioData: (audioData: string) => void; // Callback to handle base64 audio
    onVisualWarning?: (msg: string) => void;
}

export function useInterviewSession({ url, onAudioData, onVisualWarning }: UseInterviewSessionProps) {
  const [state, setState] = useState<InterviewState>({
    isConnected: false,
    phase: 'initial',
    transcript: [],
    currentQuestion: "면접 대기 중...",
    isMicEnabled: false,
    statusMessage: "연결 중...",
    backendPhase: 'introduction',
    systemGuide: "",
    clientUid: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext for simple audio work if needed (though onAudioData might handle playback)
  useEffect(() => {
      // Logic for audio context if we were decoding here
  }, []);

  // Initialize WebSocket
  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket Connected');
      setState(prev => ({ ...prev, isConnected: true, statusMessage: "대기 중" }));
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        } catch (e) {
            console.error("Failed to parse WS message", e);
        }
    };

    ws.onclose = () => {
        console.log('❌ WebSocket Disconnected');
        setState(prev => ({ ...prev, isConnected: false, statusMessage: "연결 끊김" }));
    };

    ws.onerror = (err) => {
        console.error("WebSocket Error:", err);
        setState(prev => ({ ...prev, isConnected: false, statusMessage: "연결 오류" }));
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
          ws.close();
      }
    };
  }, [url]);

  const handleWebSocketMessage = useCallback((data: any) => {
      switch (data.type) {
          case 'full-text': // Complete sentence from AI
              setState(prev => ({
                  ...prev,
                  transcript: [...prev.transcript, { role: 'ai', text: data.text, timestamp: Date.now() }],
                  currentQuestion: data.text // Assume AI speaks the question
              }));
              break;

          case 'audio': // Receive TTS audio chunk
              if (data.audio) {
                  onAudioData(data.audio);
                  setState(prev => ({ ...prev, phase: 'listening' })); // AI is speaking, user is listening
              }
              break;

          case 'control':
              if (data.text === 'start-mic') {
                  setState(prev => ({ ...prev, isMicEnabled: true, phase: 'answering' }));
              } else if (data.text === 'mic-audio-end') {
                  setState(prev => ({ ...prev, isMicEnabled: false, phase: 'thinking' }));
              } else if (data.text === 'interrupt') {
                  // Handle interruption logic if needed
              } else if (data.text === 'warning') {
                  if (onVisualWarning) onVisualWarning(data.message);
              }
              break;

          case 'interview-session-created':
              setState(prev => ({
                  ...prev,
                  statusMessage: "면접 세션 시작됨",
                  phase: 'intro',
                  clientUid: data.client_uid // Capture the active session ID
              }));
              break;

          case 'interview-phase-updated':
              setState(prev => ({
                  ...prev,
                  backendPhase: data.phase,
                  systemGuide: data.guide,
                  statusMessage: data.message
              }));
              break;

          case 'user_speech': // Echo back user speech (custom type we might need to add to backend often)
             // If the backend sends back what it recognized:
             // setState(prev => ({ ...prev, transcript: [...prev.transcript, { role: 'user', text: data.text, timestamp: Date.now() }] }));
             break;

          default:
              break;
      }
  }, [onAudioData, onVisualWarning]);


  const startSession = (jd: string, resume: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          // Send init-interview-session
          wsRef.current.send(JSON.stringify({
              type: 'init-interview-session',
              jd,
              resume,
              style: 'professional'
          }));
          setState(prev => ({ ...prev, statusMessage: "면접 준비 중 (AI 분석)..." }));
      } else {
          console.warn("WS not ready to start session");
      }
  };

  const updatePhase = (phase: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
              type: 'update-interview-phase',
              phase
          }));
      }
  };

  const sendUserAudio = (chunk: Float32Array) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          // Convert Float32 to standard array for JSON (or use binary if backend supports)
          // Backend expects 'mic-audio-data' with 'audio': float list
          wsRef.current.send(JSON.stringify({
              type: 'mic-audio-data',
              audio: Array.from(chunk)
          }));
      }
  };

  const sendBehaviorData = (data: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
              type: 'behavior-data',
              data
          }));
      }
  };

  return {
    state,
    startSession,
    updatePhase,
    sendUserAudio,
    sendBehaviorData
  };
}

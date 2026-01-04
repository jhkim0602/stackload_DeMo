"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Track } from "livekit-client";
import { useLocalParticipant } from "@livekit/components-react";

interface NonVerbalAnalyzerProps {
  /** debug overlay on/off */
  debug?: boolean;
  /** send analysis data to backend */
  onData?: (data: {
    timestamp: number;
    gaze_direction: string;
    pose_status: string;
    face_visible: boolean;
    meta?: Record<string, any>;
  }) => void;
  /** optional direct stream (bypass LiveKit camera track lookup) */
  localStream?: MediaStream | null;
  /** send interval ms (default 1000) */
  sendIntervalMs?: number;
  /** how long to freeze last good overlay before declaring "lost" (default 1200ms) */
  freezeTimeoutMs?: number;
}

/**
 * FINAL NonVerbalAnalyzer.tsx
 * - Fixes flicker by:
 *   1) Never clearing canvas on intermittent detection failures
 *   2) Using a render state machine (tracking/lost)
 *   3) Freezing last good frame for a timeout window
 *   4) Using requestVideoFrameCallback when available (better sync than rAF)
 * - Avoids window globals; uses refs
 */
export function NonVerbalAnalyzer({
  debug = false,
  onData,
  localStream,
  sendIntervalMs = 1000,
  freezeTimeoutMs = 1200,
}: NonVerbalAnalyzerProps) {
  const { localParticipant } = useLocalParticipant();

  // --- MediaPipe objects ---
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null);
  const [status, setStatus] = useState<string>("Initializing...");

  // --- video/canvas refs ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Track reference ---
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);

  // --- Timing / scheduling ---
  const rafIdRef = useRef<number | null>(null);
  const vfcHandleRef = useRef<number | null>(null); // requestVideoFrameCallback handle (not cancelable by id in all browsers)
  const runningRef = useRef<boolean>(false);
  const lastVideoTimeRef = useRef<number>(-1);

  // --- Render state machine ---
  // tracking: we draw; lost: we keep last frame (freeze) and optionally show badge; we do NOT clear each frame.
  const renderStateRef = useRef<"tracking" | "lost">("lost");
  const lastGoodMsRef = useRef<number>(0);

  // --- Persistence caches ---
  const lastLandmarksRef = useRef<any[] | null>(null);

  // --- Throttle sending to backend (no window globals) ---
  const lastSentMsRef = useRef<number>(0);

  // =========================
  // Landmark indices constants
  // =========================
  const IDX = useMemo(
    () => ({
      LEFT_EYE: [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7],
      RIGHT_EYE: [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382],
      LEFT_IRIS: [469, 470, 471, 472],
      RIGHT_IRIS: [474, 475, 476, 477],
      // for ratio:
      LEFT_EYE_INNER: 133,
      LEFT_EYE_OUTER: 33,
      RIGHT_EYE_OUTER: 263,
      // iris "center" landmark exists:
      LEFT_IRIS_CENTER: 468,
    }),
    []
  );

  // =========================
  // 1) Load MediaPipe
  // =========================
  useEffect(() => {
    let disposed = false;

    const init = async () => {
      try {
        setStatus("Loading MediaPipe...");
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );

        const lm = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: false,
          // a bit relaxed to reduce intermittent drops:
          minFaceDetectionConfidence: 0.35,
          minFacePresenceConfidence: 0.35,
          minTrackingConfidence: 0.35,
        });

        if (!disposed) {
          setLandmarker(lm);
          setStatus("Ready");
        } else {
          lm.close?.();
        }
      } catch (e) {
        console.error("MediaPipe Init Error:", e);
        setStatus("Error");
      }
    };

    init();

    return () => {
      disposed = true;
    };
  }, []);

  // =========================
  // 2) Resolve video track
  //    - localStream first
  //    - else LiveKit camera track
  // =========================
  useEffect(() => {
    if (localStream) {
      const t = localStream.getVideoTracks?.()[0] ?? null;
      setVideoTrack(t);
      return;
    }

    if (!localParticipant) return;

    const updateTrack = () => {
      const pub = localParticipant.getTrackPublication(Track.Source.Camera);
      const t = pub?.track?.mediaStreamTrack ?? null;
      setVideoTrack(t);
    };

    // initial
    updateTrack();

    // subscribe to events
    localParticipant.on("trackPublished", updateTrack);
    localParticipant.on("trackSubscribed", updateTrack);
    localParticipant.on("trackUnpublished", updateTrack);
    localParticipant.on("trackMuted", updateTrack);
    localParticipant.on("trackUnmuted", updateTrack);

    return () => {
      localParticipant.off("trackPublished", updateTrack);
      localParticipant.off("trackSubscribed", updateTrack);
      localParticipant.off("trackUnpublished", updateTrack);
      localParticipant.off("trackMuted", updateTrack);
      localParticipant.off("trackUnmuted", updateTrack);
    };
  }, [localParticipant, localStream]);

  // =========================
  // 3) Attach track to hidden video element
  // =========================
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoTrack) return;

    const stream = new MediaStream([videoTrack]);
    v.srcObject = stream;

    // iOS/Safari sometimes needs explicit play call
    v.play().catch((e) => console.error("Video play error:", e));

    return () => {
      // clean srcObject to avoid leaks
      try {
        v.pause();
      } catch {}
      // @ts-ignore
      v.srcObject = null;
    };
  }, [videoTrack]);

  // =========================
  // helpers: geometry / drawing
  // =========================
  const getCenter = (landmarks: any[], indices: number[]) => {
    let x = 0,
      y = 0;
    for (const idx of indices) {
      x += landmarks[idx].x;
      y += landmarks[idx].y;
    }
    return { x: x / indices.length, y: y / indices.length };
  };

  const getBoundingBox = (landmarks: any[], indices: number[]) => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (const idx of indices) {
      const p = landmarks[idx];
      if (!p) continue;
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    return { minX, minY, maxX, maxY };
  };

  const computeGazeAndPose = (landmarks: any[]) => {
    // --- Gaze ratio ---
    const leftInner = landmarks[IDX.LEFT_EYE_INNER];
    const leftOuter = landmarks[IDX.LEFT_EYE_OUTER];
    const irisCenter = landmarks[IDX.LEFT_IRIS_CENTER];

    const eyeWidth = Math.abs(leftOuter.x - leftInner.x) || 0.0001;
    const irisDist = Math.abs(irisCenter.x - leftInner.x);
    const ratio = irisDist / eyeWidth;

    // Backend expects: 'center', 'left', 'right', 'up', 'down'
    let gazeDir = "center";
    if (ratio < 0.35) gazeDir = "right"; // User looking right (screen left)
    else if (ratio > 0.65) gazeDir = "left"; // User looking left (screen right)

    // --- Head tilt (simple) ---
    const leftY = leftOuter.y;
    const rightOuter = landmarks[IDX.RIGHT_EYE_OUTER];
    const yDiff = Math.abs(leftY - rightOuter.y);

    // Backend expects: 'good', 'bad'
    let poseStat = "good";
    if (yDiff > 0.05) poseStat = "bad";

    return { gazeDir, poseStat, ratio, yDiff };
  };

  const drawOverlay = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    landmarks: any[],
    computed: { gazeDir: string; poseStat: string; ratio: number; yDiff: number },
    debug: boolean,
    renderState: "tracking" | "lost"
  ) => {
    // We only clear immediately before drawing a NEW frame.
    // This prevents blank frames on intermittent detection.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (debug) {
      // eye boxes
      const leftBox = getBoundingBox(landmarks, IDX.LEFT_EYE);
      const rightBox = getBoundingBox(landmarks, IDX.RIGHT_EYE);

      const boxToPx = (b: any) => ({
        x: b.minX * canvas.width,
        y: b.minY * canvas.height,
        w: (b.maxX - b.minX) * canvas.width,
        h: (b.maxY - b.minY) * canvas.height,
      });

      const lb = boxToPx(leftBox);
      const rb = boxToPx(rightBox);

      ctx.strokeStyle = "white";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(lb.x, lb.y, lb.w, lb.h);
      ctx.strokeRect(rb.x, rb.y, rb.w, rb.h);

      // iris circles
      const li = getCenter(landmarks, IDX.LEFT_IRIS);
      const ri = getCenter(landmarks, IDX.RIGHT_IRIS);

      ctx.strokeStyle = "white";
      ctx.fillStyle = "rgba(255,255,255,0.25)";

      ctx.beginPath();
      ctx.arc(li.x * canvas.width, li.y * canvas.height, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ri.x * canvas.width, ri.y * canvas.height, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      // label panel
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(10, 10, 280, 90);

      ctx.font = "bold 16px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      const ok = computed.gazeDir === "center" && computed.poseStat === "good";

      // UI Display Strings
      const uiGaze = computed.gazeDir === "center" ? "Center" : computed.gazeDir === "left" ? "Left (Away)" : "Right (Away)";
      const uiPose = computed.poseStat === "good" ? "Good" : "Bad (Tilt)";

      ctx.fillStyle = ok ? "#00FF66" : "#FF3355";
      ctx.fillText(`Gaze: ${uiGaze}`, 20, 35);
      ctx.fillText(`Pose: ${uiPose}`, 20, 58);

      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      ctx.fillText(`ratio=${computed.ratio.toFixed(2)} yDiff=${computed.yDiff.toFixed(3)} state=${renderState}`, 20, 78);
    }
  };

  // =========================
  // 4) Main analysis loop
  // =========================
  useEffect(() => {
    if (!landmarker || !videoRef.current || !canvasRef.current || !videoTrack) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    runningRef.current = true;

    // ensure canvas matches video size when ready
    const syncCanvasSize = () => {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w > 0 && h > 0) {
        if (canvas.width !== w) canvas.width = w;
        if (canvas.height !== h) canvas.height = h;
      }
    };

    const loop = () => {
      if (!runningRef.current) return;

      // Update size
      syncCanvasSize();

      const nowMs = performance.now();

      // Only run when video has frame data
      if (video.readyState >= 2 && video.videoWidth > 0) {
        // Avoid reprocessing same frame in some browsers
        const ct = video.currentTime;
        if (ct !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = ct;

          let faceVisible = false;
          let landmarksToUse: any[] | null = null;

          // Detect
          const result = landmarker.detectForVideo(video, nowMs);

          if (result.faceLandmarks && result.faceLandmarks.length > 0) {
            landmarksToUse = result.faceLandmarks[0];
            lastLandmarksRef.current = landmarksToUse;
            faceVisible = true;
            renderStateRef.current = "tracking";
            lastGoodMsRef.current = nowMs;
          } else {
            // No detection: freeze last good for timeout
            const elapsed = nowMs - (lastGoodMsRef.current || 0);
            if (lastLandmarksRef.current && elapsed <= freezeTimeoutMs) {
              landmarksToUse = lastLandmarksRef.current;
              faceVisible = true; // visually still showing
              // keep tracking state to avoid clearing
              renderStateRef.current = "tracking";
            } else {
              // truly lost
              renderStateRef.current = "lost";
              faceVisible = false;
              landmarksToUse = null;

              // IMPORTANT: Do NOT clear every frame; only clear once when switching to lost.
              // We'll clear only if we are in lost AND debug wants it obvious:
              if (debug) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
            }
          }

          // Draw only in tracking state
          if (renderStateRef.current === "tracking" && landmarksToUse) {
            const computed = computeGazeAndPose(landmarksToUse);
            drawOverlay(ctx, canvas, landmarksToUse, computed, debug, renderStateRef.current);

            // send throttled
            const wallNow = Date.now();
            if (onData && wallNow - lastSentMsRef.current >= sendIntervalMs) {
              lastSentMsRef.current = wallNow;
              onData({
                timestamp: wallNow / 1000,
                gaze_direction: computed.gazeDir,
                pose_status: computed.poseStat,
                face_visible: faceVisible,
                meta: debug
                  ? {
                      ratio: computed.ratio,
                      yDiff: computed.yDiff,
                      renderState: renderStateRef.current,
                      freezeMs: Math.max(0, freezeTimeoutMs - (nowMs - lastGoodMsRef.current)),
                    }
                  : undefined,
              });
            }
          } else {
            // in lost state, still send heartbeat occasionally (optional)
            const wallNow = Date.now();
            if (onData && wallNow - lastSentMsRef.current >= sendIntervalMs) {
              lastSentMsRef.current = wallNow;
              onData({
                timestamp: wallNow / 1000,
                gaze_direction: "Center",
                pose_status: "Bad (No Face)",
                face_visible: false,
                meta: debug ? { renderState: "lost" } : undefined,
              });
            }
          }
        }
      }

      // Schedule next frame (prefer video-frame callback)
      if (typeof (video as any).requestVideoFrameCallback === "function") {
        // requestVideoFrameCallback provides tighter sync with actual decoded frames
        (video as any).requestVideoFrameCallback(() => loop());
      } else {
        rafIdRef.current = requestAnimationFrame(loop);
      }
    };

    // Start
    // If requestVideoFrameCallback exists, use it immediately (better than rAF)
    if (typeof (video as any).requestVideoFrameCallback === "function") {
      (video as any).requestVideoFrameCallback(() => loop());
    } else {
      rafIdRef.current = requestAnimationFrame(loop);
    }

    return () => {
      runningRef.current = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      // Can't reliably cancel requestVideoFrameCallback in all browsers; stopping via runningRef is enough.
    };
  }, [landmarker, videoTrack, debug, onData, sendIntervalMs, freezeTimeoutMs]);

  // If not debug and no track, render nothing.
  if (!debug && !videoTrack) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Hidden processing video */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      {/* Overlay Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover mirror-mode" />

      {/* Status Badge */}
      {debug && (
        <div className="absolute top-2 right-2 flex gap-2">
          <div className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
            Eye Tracking Active
          </div>
          <div className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
            {status} / {renderStateRef.current}
          </div>
        </div>
      )}
    </div>
  );
}

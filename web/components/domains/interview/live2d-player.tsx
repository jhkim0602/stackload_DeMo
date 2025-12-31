"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import * as PIXI from "pixi.js";

// Define prop types
interface Live2DPlayerProps {
  modelUrl: string;
  isSpeaking: boolean;
  className?: string; // Allow custom styling
}

export default function Live2DPlayer({ modelUrl, isSpeaking, className }: Live2DPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const modelRef = useRef<any>(null); // Type 'any' because Live2DModel is imported dynamically
  const [error, setError] = useState<string | null>(null);
  const [isCubismLoaded, setIsCubismLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !isCubismLoaded) return;

    // Use a flag to prevent double initialization in Strict Mode
    let isMounted = true;

    const init = async () => {
      try {
        if (appRef.current) return; // Already initialized

        // Expose PIXI to window for pixi-live2d-display
        if (typeof window !== "undefined") {
          (window as any).PIXI = PIXI;
        }

        // Dynamically import pixi-live2d-display ONLY after Cubism is loaded
        const { Live2DModel } = await import("pixi-live2d-display/cubism4");
        Live2DModel.registerTicker(PIXI.Ticker);

        const app = new PIXI.Application({
          view: canvasRef.current,
          autoStart: true,
          backgroundAlpha: 0, // Transparent background
          width: 800,
          height: 800,
          resizeTo: canvasRef.current.parentElement as HTMLElement,
        });

        appRef.current = app;

        console.log("Loading Live2D Model:", modelUrl);
        const model = await Live2DModel.from(modelUrl);

        if (!isMounted) {
            app.destroy(true);
            return;
        }

        modelRef.current = model;
        app.stage.addChild(model);

        // Center and scale model
        const scaleX = (app.renderer.width * 0.8) / model.width;
        const scaleY = (app.renderer.height * 0.8) / model.height;
        const scale = Math.min(scaleX, scaleY);

        model.scale.set(scale);
        model.x = (app.renderer.width - model.width) / 2;
        model.y = (app.renderer.height - model.height * 0.8); // slight offset from bottom

      } catch (e) {
        console.error("Failed to load Live2D model:", e);
        if(isMounted) setError("Failed to load avatar.");
      }
    };

    init();

    return () => {
      isMounted = false;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
        modelRef.current = null;
      }
    };
  }, [modelUrl, isCubismLoaded]); // Re-init if URL changes or Cubism loads

  // Handle Speaking Animation (Lip Sync or generic motion)
  useEffect(() => {
    if (!modelRef.current) return;

    // Note: Accurate lip-sync requires passing audio volume/FFT to the model parameter 'ParamMouthOpenY'
    // For now, we simulate simple speaking motion or check if standard motion exists

    // If we had audio volume passed as prop, we would do:
    // modelRef.current.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', volume);

    // Simple fallback: Random mouth movement if speaking

    let interval: NodeJS.Timeout;
    if (isSpeaking) {
        interval = setInterval(() => {
             const val = Math.random();
             modelRef.current?.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', val);
        }, 100);
    } else {
         modelRef.current?.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', 0);
    }
    return () => clearInterval(interval);


  }, [isSpeaking]);

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <>
        <Script
            src="/live2d/live2dcubismcore.min.js"
            onLoad={() => {
                console.log("Cubism Core loaded");
                setIsCubismLoaded(true);
            }}
            onError={(e) => {
                console.error("Failed to load Cubism Core", e);
                setError("Failed to load Live2D Core Runtime.");
            }}
        />
        <canvas
            ref={canvasRef}
            className={className}
        />
    </>
  );
}

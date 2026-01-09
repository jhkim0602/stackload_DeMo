"use client";

import { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import { Loader2, Cloud } from "lucide-react";
import { useTheme } from "next-themes";

export interface IdeaBoardSDKProps {
  projectId: string;
}

export default function IdeaBoardSDK({ projectId }: IdeaBoardSDKProps) {
  const { theme } = useTheme();
  const [elements, setElements] = useState<any[]>([]);
  const [appState, setAppState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const STORAGE_KEY = `workspace_board_${projectId}`;

  useEffect(() => {
    setIsLoading(true);
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Sanitize: collaborators 데이터를 제거하고 로드 (크래시 방지)
        const { collaborators, ...restAppState } = parsed.appState || {};
        setElements(parsed.elements || []);
        setAppState(restAppState);
        setLastSaved(new Date());
      } catch (error) {
        console.error("Failed to parse board data", error);
      }
    }

    const timeout = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timeout);
  }, [STORAGE_KEY]);

  const saveData = useCallback(
    debounce((newElements: any, newAppState: any) => {
      // Sanitize: collaborators 데이터를 제외하고 저장
      const { collaborators, ...stateToSave } = newAppState;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ elements: newElements, appState: stateToSave })
      );
      setLastSaved(new Date());
    }, 1000),
    [STORAGE_KEY]
  );

  const handleChange = useCallback(
    (newElements: any, newAppState: any) => {
      saveData(newElements, newAppState);
    },
    [saveData]
  );

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 gap-4">
        <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
        </div>
        <div className="text-sm font-medium text-gray-500 animate-pulse">
          필기도구 가져오는중....
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col relative bg-white dark:bg-zinc-950">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 pointer-events-none">
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center gap-2 pointer-events-auto">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">아이디어 화이트보드</span>
        </div>
        {lastSaved && (
          <div className="bg-white/60 dark:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-zinc-800/50 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 transition-opacity duration-500">
            <Cloud className="h-3 w-3" />
            <span>Saved {lastSaved.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      <div className="flex-1 w-full h-full">
        <Excalidraw
          initialData={{
            elements,
            appState,
            scrollToContent: true,
          }}
          onChange={handleChange as any}
          theme={theme === "dark" ? "dark" : "light"}
          UIOptions={{
            canvasActions: {
              changeViewBackgroundColor: true,
              clearCanvas: true,
              loadScene: false,
              toggleTheme: false,
            },
          }}
        >
          <MainMenu>
            <MainMenu.DefaultItems.Export />
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>
          <WelcomeScreen />
        </Excalidraw>
      </div>
    </div>
  );
}

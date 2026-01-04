"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Video, MessageSquareQuote } from "lucide-react";

interface ModeSelectionProps {
  onSelect: (mode: "video" | "pre-qna", personality: string) => void;
}

export function ModeSelection({ onSelect }: ModeSelectionProps) {
  const [mode, setMode] = useState<"video" | "pre-qna">("pre-qna"); // Default to Pre-Q&A as it's lighter
  const [personality, setPersonality] = useState("gentle");

  const handleStart = () => {
    onSelect(mode, personality);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">면접 방식 선택</h2>
            <p className="text-muted-foreground">원하는 방식으로 면접 준비를 시작해보세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pre-Q&A Mode */}
            <div
                className={`cursor-pointer rounded-xl border-2 p-6 transition-all hover:border-indigo-500 hover:shadow-md ${mode === 'pre-qna' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-muted'}`}
                onClick={() => setMode("pre-qna")}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                        <MessageSquareQuote className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                    </div>
                    <RadioGroup value={mode} className="pointer-events-none">
                        <RadioGroupItem value="pre-qna" id="mode-pre-qna" checked={mode === 'pre-qna'} />
                    </RadioGroup>
                </div>
                <h3 className="text-lg font-bold mb-2">사전 예상 질문</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    AI가 분석한 예상 질문 리스트를 미리 확인하고, 텍스트로 답변을 정리하며 피드백을 받을 수 있습니다.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs bg-muted px-2 py-1 rounded">질문 리스트</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">답변 피드백</span>
                </div>
            </div>

            {/* Video Mode */}
            <div
                className={`cursor-pointer rounded-xl border-2 p-6 transition-all hover:border-indigo-500 hover:shadow-md ${mode === 'video' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-muted'}`}
                onClick={() => setMode("video")}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                        <Video className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                    </div>
                    <RadioGroup value={mode} className="pointer-events-none">
                        <RadioGroupItem value="video" id="mode-video" checked={mode === 'video'} />
                    </RadioGroup>
                </div>
                <h3 className="text-lg font-bold mb-2">실전 화상 면접</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    실제 면접관(AI Avatar)과 대화하며 표정, 목소리, 답변 내용을 실전처럼 연습합니다.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs bg-muted px-2 py-1 rounded">실시간 대화</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">비언어 피드백</span>
                </div>
            </div>
        </div>

        {mode === 'video' && (
            <Card className="animate-in fade-in slide-in-from-top-2">
                <CardContent className="pt-6">
                    <Label className="text-base font-medium mb-3 block">면접관 페르소나 (성격) 선택</Label>
                    <RadioGroup value={personality} onValueChange={setPersonality} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className={`border rounded-lg p-3 cursor-pointer hover:bg-muted ${personality === 'gentle' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : ''}`} onClick={() => setPersonality('gentle')}>
                            <div className="flex items-center gap-2 mb-1">
                                <RadioGroupItem value="gentle" id="pers-gentle" />
                                <Label htmlFor="pers-gentle" className="cursor-pointer font-bold">친절한 면접관</Label>
                            </div>
                            <p className="text-xs text-muted-foreground pl-6">편안한 분위기에서 장점을 이끌어줍니다.</p>
                        </div>
                        <div className={`border rounded-lg p-3 cursor-pointer hover:bg-muted ${personality === 'sharp' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : ''}`} onClick={() => setPersonality('sharp')}>
                            <div className="flex items-center gap-2 mb-1">
                                <RadioGroupItem value="sharp" id="pers-sharp" />
                                <Label htmlFor="pers-sharp" className="cursor-pointer font-bold">날카로운 면접관</Label>
                            </div>
                            <p className="text-xs text-muted-foreground pl-6">논리적 허점을 파고드는 압박 질문 위주.</p>
                        </div>
                        <div className={`border rounded-lg p-3 cursor-pointer hover:bg-muted ${personality === 'tech' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : ''}`} onClick={() => setPersonality('tech')}>
                            <div className="flex items-center gap-2 mb-1">
                                <RadioGroupItem value="tech" id="pers-tech" />
                                <Label htmlFor="pers-tech" className="cursor-pointer font-bold">기술 면접관</Label>
                            </div>
                            <p className="text-xs text-muted-foreground pl-6">기술적 깊이와 구현 능력을 검증합니다.</p>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>
        )}

        <Button size="lg" className="w-full text-lg h-14" onClick={handleStart}>
            {mode === 'pre-qna' ? '예상 질문 확인하기' : '화상 면접 입장하기'}
        </Button>
    </div>
  );
}

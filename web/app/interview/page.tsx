"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobUrlInput } from "@/components/domains/interview/job-url-input";
import { JobAnalysisResult } from "@/components/domains/interview/job-analysis-result";
import { ModeSelection } from "@/components/domains/interview/mode-selection";
import { InterviewDashboardCards } from "@/components/domains/interview/interview-dashboard-cards";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ChevronRight } from "lucide-react";

type ViewState = "dashboard" | "analysis_result" | "mode_selection";

export default function InterviewPage() {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleUrlSubmit = (url: string, resumeData?: any) => {
    setIsAnalyzing(true);
    // Simulate API call delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setViewState("analysis_result");
    }, 2500);
  };

  const handleAnalysisNext = () => {
    setViewState("mode_selection");
  };

  const handleModeSelect = (mode: "video" | "pre-qna", personality: string) => {
    if (mode === "video") {
      router.push(`/interview/room?personality=${personality}`);
    } else {
      router.push(`/interview/pre-qna`);
    }
  };

  const handleBackToDashboard = () => {
      setViewState("dashboard");
  };

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">

      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight cursor-pointer" onClick={handleBackToDashboard}>AI 면접 코칭 센터</h1>
            <p className="text-muted-foreground mt-1">
                성공적인 취업을 위한 나만의 면접 파트너
            </p>
          </div>
          {viewState !== 'dashboard' && (
              <button onClick={handleBackToDashboard} className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
                  대시보드로 돌아가기
              </button>
          )}
      </div>

      <div className="space-y-12">
        {/* Dynamic Content Area */}
        <div className="transition-all duration-500 min-h-[400px]">
            {viewState === "dashboard" && (
                <div className="space-y-12">
                    {/* Hero: Job Analysis */}
                    <section>
                         <JobUrlInput onSubmit={handleUrlSubmit} isAnalyzing={isAnalyzing} />
                    </section>

                    {/* Quick Access Cards */}
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                             빠른 실행
                        </h2>
                        <InterviewDashboardCards />
                    </section>

                    {/* Recent History (Mock) */}
                     <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                             <Clock className="w-5 h-5 text-indigo-500" /> 최근 활동
                        </h2>
                        <div className="grid gap-4">
                            {[1, 2].map((i) => (
                                <Card key={i} className="hover:bg-muted/30 transition-colors cursor-pointer">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                                D-{i}
                                            </div>
                                            <div>
                                                <p className="font-medium">원티드랩 프로덕트 디자이너 (시니어)</p>
                                                <p className="text-xs text-muted-foreground">어제 확인한 공고 • 사전 Q&A 연습 완료</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {viewState === "analysis_result" && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <JobAnalysisResult onNext={handleAnalysisNext} />
                </div>
            )}

            {viewState === "mode_selection" && (
                 <div className="animate-in fade-in zoom-in-95">
                    <ModeSelection onSelect={handleModeSelect} />
                 </div>
            )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FeedbackReport, InterviewReport } from "@/components/features/interview/result/feedback-report";
import { Button } from "@/components/ui/button";
import { Loader2, Home, RotateCcw } from "lucide-react";

import { MOCK_DASHBOARD_DATA } from "@/components/features/interview/result/mock-data";
import { ExecutiveSummary } from "@/components/features/interview/result/executive-summary";
import { ContextViewer } from "@/components/features/interview/result/context-viewer";
import { ScriptViewer } from "@/components/features/interview/result/script-viewer";
import { FeedbackCard } from "@/components/features/interview/result/feedback-card";

export default function InterviewResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uid = searchParams.get("uid");

  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMock = uid === 'mock';
  const data = isMock ? MOCK_DASHBOARD_DATA.report : report;

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    if (uid === 'mock') {
        setLoading(false);
        return;
    }

    const fetchReport = async () => {
      setLoading(true);
      try {
        // Assuming API is proxied via Next.js or directly accessible
        // In local dev, backend is at localhost:12393.
        // We should really go through a Next.js API route or proxy, but for now direct call if no proxy setup
        // Or better, use the proxy route if it exists.
        // Based on previous files, backend is at localhost:12393.
        // Let's try fetching directly first (CORS is enabled in backend).

        const response = await fetch(`http://localhost:12393/interview/report/${uid}`);

        if (!response.ok) {
            if (response.status === 404) throw new Error("결과를 찾을 수 없습니다.");
            throw new Error("리포트 조회 실패");
        }

        const data = await response.json();
        setReport(data);

      } catch (err: any) {
        setError(err.message || "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [uid]);

  if (!uid) {
      return <div className="p-10 text-center">잘못된 접근입니다.</div>;
  }

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                  <p className="text-slate-500 animate-pulse">분석 리포트 생성 중...</p>
              </div>
          </div>
      );
  }

  if (error) {
       return (
          <div className="min-h-screen flex flex-col items-center justify-center gap-4">
              <p className="text-red-500 font-semibold">{error}</p>
              <div className="flex gap-2">
                 <Button variant="outline" onClick={() => router.push("/")}>홈으로</Button>
                 <Button onClick={() => window.location.reload()}>재시도</Button>
                 <Button variant="secondary" onClick={() => router.push("/interview/result?uid=mock")}>
                    샘플 리포트 보기
                 </Button>
              </div>
          </div>
      );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-14 z-10 opacity-95 backdrop-blur">
            <div className="container max-w-7xl mx-auto py-4 px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
                            AI 면접 분석 리포트
                            {isMock && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono align-middle tracking-normal font-normal">체험 모드</span>}
                        </h1>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto justify-center md:justify-end">
                        <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-slate-500">
                            <Home className="w-4 h-4 mr-2" />
                            홈으로
                        </Button>
                        <Button size="sm" onClick={() => router.push("/interview/setup")} className="bg-indigo-600 hover:bg-indigo-700">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            새 면접 시작
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        {/* Dashboard Content */}
        <div className="container max-w-7xl mx-auto py-8 px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Panel: Context & Script (lg:col-span-4) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Context Viewer */}
                    <ContextViewer
                        jdText={isMock ? (data as any).jd_text : "JD 정보가 없습니다."}
                        resumeText={isMock ? (data as any).resume_text : "이력서 정보가 없습니다."}
                    />

                    {/* Script Viewer */}
                    <ScriptViewer
                        transcript={isMock ? (data as any).transcript : []}
                    />
                </div>

                {/* Right Panel: Analysis & Feedback (lg:col-span-8) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Executive Summary */}
                    <ExecutiveSummary
                        overallSummary={data.overall_summary}
                        style={data.style}
                        totalQuestions={data.total_questions}
                        duration={isMock ? (data as any).duration : "N/A"}
                    />

                    {/* Detailed Feedback List */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                상세 역량 분석표
                            </h2>
                            <span className="text-xs text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                총 {data.details.length}개 항목
                            </span>
                        </div>

                        {data.details.map((item, idx) => (
                            <FeedbackCard key={idx} item={item} />
                        ))}
                    </div>

                </div>
            </div>

            <div className="text-center pt-12 pb-8">
                <p className="text-xs text-slate-400">
                    StackLoad AI 분석 엔진 | 본 리포트는 지원자 본인만 열람 가능합니다.
                </p>
            </div>
        </div>
    </div>
  );
}

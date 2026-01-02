"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FeedbackReport, InterviewReport } from "@/components/domains/interview/feedback-report";
import { Button } from "@/components/ui/button";
import { Loader2, Home, RotateCcw } from "lucide-react";

export default function InterviewResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uid = searchParams.get("uid");

  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
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
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <h1 className="text-xl font-bold">잘못된 접근입니다.</h1>
            <Button onClick={() => router.push("/")}>홈으로 돌아가기</Button>
        </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">면접 결과를 분석 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <h1 className="text-xl font-bold text-red-500">오류 발생</h1>
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push("/")}>홈으로</Button>
                <Button onClick={() => window.location.reload()}>다시 시도</Button>
            </div>
        </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">면접 분석 결과</h1>
          <p className="text-muted-foreground mt-1">
            AI 면접관이 분석한 피드백 리포트입니다.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/")}>
                <Home className="w-4 h-4 mr-2" />
                홈으로
            </Button>
            <Button size="sm" onClick={() => router.push("/interview/setup")}>
                <RotateCcw className="w-4 h-4 mr-2" />
                새 면접 시작
            </Button>
        </div>
      </div>

      {report ? (
        <FeedbackReport report={report} />
      ) : (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
            데이터가 없습니다.
        </div>
      )}
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareQuote, Video, Mic, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function InterviewDashboardCards() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      {/* Card 1: Pre-Q&A */}
      <Card className="hover:shadow-lg transition-shadow border-indigo-100 dark:border-indigo-900 cursor-pointer group" onClick={() => router.push('/interview/pre-qna')}>
        <CardHeader>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <MessageSquareQuote className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle>사전 예상 질문</CardTitle>
            <CardDescription>
                AI가 분석한 직무별 예상 질문 리스트를 확인하고 답변을 연습합니다.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="ghost" className="p-0 text-indigo-600 dark:text-indigo-400 hover:bg-transparent group-hover:translate-x-1 transition-transform">
                연습하러 가기 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
        </CardContent>
      </Card>

      {/* Card 2: Video Interview */}
      <Card className="hover:shadow-lg transition-shadow border-purple-100 dark:border-purple-900 cursor-pointer group" onClick={() => router.push('/interview/room')}>
         <CardHeader>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle>실전 화상 면접</CardTitle>
            <CardDescription>
                AI 면접관과 함께 실제 면접 환경과 유사한 화상 면접을 진행합니다.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="ghost" className="p-0 text-purple-600 dark:text-purple-400 hover:bg-transparent group-hover:translate-x-1 transition-transform">
                면접장 입장하기 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
        </CardContent>
      </Card>

      {/* Card 3: Mic Test / Settings (Optional placeholder for balance) */}
      <Card className="hover:shadow-lg transition-shadow border-muted cursor-pointer group hover:bg-muted/30">
         <CardHeader>
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <CardTitle>환경 설정</CardTitle>
            <CardDescription>
                카메라와 마이크 상태를 점검하고 면접 환경을 최적화합니다.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Button variant="ghost" className="p-0 text-muted-foreground hover:bg-transparent" disabled>
                준비 중입니다
            </Button>
        </CardContent>
      </Card>

    </div>
  );
}

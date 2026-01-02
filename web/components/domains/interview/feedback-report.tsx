"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, ChevronRight, FileText, Lightbulb, Target, TrendingUp, Zap, MessageSquare, User } from "lucide-react";

interface FeedbackDetail {
    feedback: string;
    follow_up_question: string | null;
}

interface InterviewTurn {
    turn: number;
    question: string;
    answer: string;
    feedback: FeedbackDetail;
}

export interface InterviewReport {
    candidate_uid: string;
    style: string;
    total_questions: number;
    details: InterviewTurn[];
    overall_summary: string;
}

interface FeedbackReportProps {
    report: InterviewReport;
}

export function FeedbackReport({ report }: FeedbackReportProps) {
  const { details, overall_summary, style } = report;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

      {/* 1. Overall Evaluation */}
      <Card>
        <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <FileText className="w-5 h-5 text-indigo-500" /> 종합 요약
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex gap-2 mb-3">
                 <Badge variant="outline">스타일: {style}</Badge>
                 <Badge variant="outline">총 질문: {report.total_questions}</Badge>
            </div>
            <p className="leading-relaxed text-sm text-muted-foreground">
                {overall_summary}
            </p>
        </CardContent>
      </Card>

      {/* 2. Question specific Feedback */}
      {details.map((item, idx) => (
        <Card key={idx} className="overflow-hidden">
             <CardHeader className="pb-2 border-b bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Target className="w-5 h-5 text-blue-500" /> Q{item.turn}. {item.question}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">

                {/* User Answer */}
                <div className="bg-muted/30 p-3 rounded-md border">
                    <div className="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-700">
                        <User className="w-4 h-4" /> 내 답변
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {item.answer || "(답변 없음)"}
                    </p>
                </div>

                {/* AI Feedback */}
                <div className="bg-indigo-50/50 p-3 rounded-md border border-indigo-100">
                    <div className="flex items-center gap-2 mb-1 text-sm font-semibold text-indigo-700">
                        <MessageSquare className="w-4 h-4" /> AI 피드백
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {item.feedback.feedback}
                    </p>
                </div>

                {/* Follow-up Question (if exists) */}
                {item.feedback.follow_up_question && (
                    <div className="pt-2">
                        <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-md border border-amber-100 text-sm">
                             <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                             <div>
                                <span className="font-bold text-amber-800 block mb-1">추천 꼬리 질문</span>
                                <span className="text-amber-700">{item.feedback.follow_up_question}</span>
                             </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      ))}

      {details.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
              평가 데이터가 없습니다.
          </div>
      )}

    </div>
  );
}

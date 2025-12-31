"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, ChevronRight, FileText, Lightbulb, Target, TrendingUp, Zap } from "lucide-react";
import { MOCK_FULL_REPORT } from "@/mocks/interview-data";

export function FeedbackReport() {
  const { overall, strengths, improvements, questions } = MOCK_FULL_REPORT;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

      {/* 1. Overall Evaluation */}
      <Card>
        <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <FileText className="w-5 h-5 text-indigo-500" /> 종합 평가
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="leading-relaxed text-sm text-muted-foreground">
                {overall.summary}
            </p>
        </CardContent>
      </Card>

      {/* 2. Strengths & Improvements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Zap className="w-5 h-5 text-amber-500 fill-amber-500" /> 강점
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {strengths.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                            {item}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>

        {/* Improvements */}
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <TrendingUp className="w-5 h-5 text-red-500" /> 개선점
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {improvements.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <ChevronRight className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                            {item}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </div>

      {/* 3. Question specific Feedback */}
      {questions.map((q, idx) => (
        <Card key={idx} className="overflow-hidden">
             <CardHeader className="pb-2 border-b bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Target className="w-5 h-5 text-blue-500" /> 질문별 피드백
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between items-start">
                     <h3 className="font-semibold">Q{idx + 1}. {q.question}</h3>
                     <Badge variant="secondary" className="ml-2 shrink-0">{q.score}점</Badge>
                </div>

                <div className="bg-muted/50 p-3 rounded-md border">
                    <p className="text-sm text-muted-foreground italic">내 답변: 지원자의 답변이 없습니다.</p>
                </div>

                <p className="text-sm">
                    {q.feedback}
                </p>

                <div className="pt-2">
                     <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="model-answer" className="border-b-0">
                            <AccordionTrigger className="text-indigo-600 hover:text-indigo-500 py-2">
                                ▶ 모범 답변 보기
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="w-5 h-5 text-amber-500" />
                                        <span className="font-bold">추천 답변 스크립트</span>
                                    </div>
                                    {q.modelAnswer.map((ans, i) => (
                                        <div key={i} className="bg-muted p-4 rounded-lg border text-sm leading-relaxed">
                                            {ans}
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                     </Accordion>
                </div>
            </CardContent>
        </Card>
      ))}

    </div>
  );
}

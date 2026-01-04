"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {  FileText,  Target, User, MessageSquare, BookOpen, ChevronDown } from "lucide-react";

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 max-w-7xl mx-auto font-sans text-slate-800 w-full">

      {/* Report Header */}
      <div className="border-b-2 border-slate-800 pb-4 mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 break-keep">
                  DIGITAL COMPETENCY REPORT
              </h1>
              <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">AI 면접 역량 진단 리포트</p>
          </div>
          <div className="text-left md:text-right flex flex-col gap-1">
              <p className="text-xs md:text-sm text-slate-400">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-xs md:text-sm text-slate-400">Candidate ID: {report.candidate_uid.slice(0, 8)}</p>
          </div>
      </div>

      {/* 1. Executive Summary (종합 평가) */}
      <section className="bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-indigo-600 rounded-lg text-white shrink-0">
                <FileText className="w-5 h-5" />
             </div>
             <h2 className="text-lg md:text-xl font-bold text-slate-800">Executive Summary</h2>
        </div>

        <div className="pl-0 md:pl-14">
            <div className="flex flex-wrap gap-2 mb-4">
                 <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-300">Style: {style}</Badge>
                 <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-300">Questions: {report.total_questions}</Badge>
            </div>
            <p className="text-slate-700 leading-relaxed text-base md:text-lg font-medium break-keep">
                "{overall_summary}"
            </p>
        </div>
      </section>

      {/* 2. Detailed Analysis (상세 분석) */}
      <section className="space-y-8">
        <h2 className="text-lg md:text-xl font-bold text-slate-800 border-l-4 border-indigo-600 pl-4 py-1">
            Detailed Analysis
        </h2>

        {details.map((item, idx) => (
          <div key={idx} className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

            {/* Question Header */}
            <div className="bg-slate-100/50 px-4 md:px-6 py-4 border-b border-slate-100 flex items-start gap-3 md:gap-4">
                <span className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-900 text-white font-bold text-xs md:text-sm shrink-0 mt-0.5">
                    Q{item.turn}
                </span>
                <h3 className="text-base md:text-lg font-semibold text-slate-800 pt-0.5 md:pt-1 leading-snug break-keep">
                    {item.question}
                </h3>
            </div>

            <div className="p-4 md:p-6 space-y-6">

                {/* User Answer */}
                <div className="flex gap-3 md:gap-4">
                     <div className="w-6 md:w-8 flex justify-center shrink-0">
                        <User className="w-5 h-5 text-slate-400" />
                     </div>
                     <div className="space-y-1 w-full min-w-0">
                         <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate Response</div>
                         <div className="text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 md:p-4 rounded-lg border border-slate-100 text-sm md:text-base break-words">
                            {item.answer || <span className="text-slate-400 italic">(답변 없음)</span>}
                         </div>
                     </div>
                </div>

                {/* Consultant Feedback */}
                <div className="flex gap-3 md:gap-4">
                     <div className="w-6 md:w-8 flex justify-center shrink-0">
                        <MessageSquare className="w-5 h-5 text-indigo-500" />
                     </div>
                     <div className="space-y-1 w-full min-w-0">
                         <div className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Consultant Feedback</div>
                         <div className="text-slate-800 leading-relaxed font-medium text-sm md:text-base break-keep">
                            {item.feedback.feedback}
                         </div>
                     </div>
                </div>

                {/* Expected Follow-up (Separated Section) */}
                {item.feedback.follow_up_question && (
                    <div className="mt-4 pt-4 border-t border-slate-100 md:ml-12">
                         <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="followup" className="border-b-0">
                                <AccordionTrigger className="py-2 hover:no-underline group-hover:text-indigo-600 transition-colors">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                        <BookOpen className="w-4 h-4" />
                                        <span>예상 꼬리 질문 (Preparation Hint)</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="bg-amber-50/50 p-3 md:p-4 rounded-lg border border-amber-100/50 text-amber-900/80 text-sm mt-2 break-keep">
                                        <span className="font-bold text-amber-800 block mb-1">💡 다음 질문을 대비해보세요:</span>
                                        "{item.feedback.follow_up_question}"
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                         </Accordion>
                    </div>
                )}
            </div>
          </div>
        ))}

        {details.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
              분석된 면접 데이터가 없습니다.
          </div>
        )}
      </section>

      <div className="text-center pt-8 pb-12">
          <p className="text-xs text-slate-400">
              StackLoad AI Interview Solution | Generated by TechMoa Engine
          </p>
      </div>

    </div>
  );
}

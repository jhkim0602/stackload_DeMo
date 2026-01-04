"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import {
    MessageSquare,
    User,
    Lightbulb,
    Quote
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FeedbackItem {
    turn: number;
    question: string;
    answer: string;
    feedback: {
        feedback: string;
        follow_up_question?: string | null;
    };
}

export function FeedbackCard({ item }: { item: FeedbackItem }) {
    return (
        <div className="group bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            {/* Question Header */}
            <div className="bg-slate-50/80 dark:bg-slate-900/50 px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start gap-4">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                    Q{item.turn}
                </span>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 leading-snug break-keep">
                    {item.question}
                </h3>
            </div>

            <div className="p-5 space-y-6">

                {/* User Answer Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                        <User className="w-3.5 h-3.5" />
                        나의 답변 (Candidate Response)
                    </div>
                    <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 py-1">
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {item.answer || <span className="text-slate-400 italic">(답변 없음)</span>}
                        </p>
                    </div>
                </div>

                {/* AI Feedback Section */}
                <div className="space-y-3">
                     <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500 uppercase tracking-wider pl-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        면접관 피드백 (AI Feedback)
                    </div>
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                        <p className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-relaxed break-keep">
                            {item.feedback.feedback}
                        </p>
                    </div>
                </div>

                {/* Preparation Hint (Footer) */}
                {item.feedback.follow_up_question && (
                    <div className="pt-2">
                         <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="hint" className="border-b-0 border border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20 rounded-lg px-0">
                                <AccordionTrigger className="px-4 py-2.5 hover:no-underline group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                                    <div className="flex items-center gap-2 text-sm text-amber-700/80 dark:text-amber-500 font-semibold">
                                        <Lightbulb className="w-4 h-4" />
                                        <span>💡 더 준비하면 좋은 팁 (Preparation Hint)</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4 pt-0">
                                    <div className="text-amber-900/80 dark:text-amber-200/80 text-sm leading-relaxed break-keep pl-6">
                                        "{item.feedback.follow_up_question}"
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                         </Accordion>
                    </div>
                )}
            </div>
        </div>
    );
}

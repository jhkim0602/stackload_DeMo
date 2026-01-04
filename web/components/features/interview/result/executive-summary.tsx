import { Badge } from "@/components/ui/badge";
import { Clock, HelpCircle, User } from "lucide-react";

interface ExecutiveSummaryProps {
    overallSummary: string;
    style: string;
    totalQuestions: number;
    duration: string;
}

export function ExecutiveSummary({ overallSummary, style, totalQuestions, duration }: ExecutiveSummaryProps) {
    return (
        <section className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    📊 종합 분석 결과
                </h2>
                <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
                         <User className="w-3.5 h-3.5" />
                         <span>{style}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
                         <HelpCircle className="w-3.5 h-3.5" />
                         <span>총 {totalQuestions}개 질문</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
                         <Clock className="w-3.5 h-3.5" />
                         <span>{duration} 소요</span>
                    </div>
                </div>
            </div>

            <div className="prose prose-sm prose-slate dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                 <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                    {overallSummary}
                 </p>
            </div>
        </section>
    );
}

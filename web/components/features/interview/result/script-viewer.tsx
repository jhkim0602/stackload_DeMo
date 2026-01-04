import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { User, Sparkles } from "lucide-react";

interface TranscriptItem {
    role: string;
    text: string;
    timestamp: string;
}

interface ScriptViewerProps {
    transcript: TranscriptItem[];
}

export function ScriptViewer({ transcript }: ScriptViewerProps) {
    return (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm h-[500px] flex flex-col">
             <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    💬 면접 대화 기록
                </h3>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {transcript.map((item, idx) => {
                        const isInterviewer = item.role === "interviewer";
                        return (
                            <div key={idx} className={cn("flex gap-3", isInterviewer ? "" : "flex-row-reverse")}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    isInterviewer ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-600"
                                )}>
                                    {isInterviewer ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                </div>
                                <div className={cn(
                                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
                                    isInterviewer
                                        ? "bg-indigo-50 text-slate-800 rounded-tl-none"
                                        : "bg-slate-100 text-slate-800 rounded-tr-none"
                                )}>
                                    <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] font-mono uppercase tracking-wider">
                                        <span>{isInterviewer ? "AI 면접관" : "나(지원자)"}</span>
                                        <span>{item.timestamp}</span>
                                    </div>
                                    <p>{item.text}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}

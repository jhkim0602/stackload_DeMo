"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Briefcase } from "lucide-react";

interface ContextViewerProps {
    jdText: string;
    resumeText: string;
}

export function ContextViewer({ jdText, resumeText }: ContextViewerProps) {
    return (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm h-[400px] flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    📑 면접 참고 자료
                </h3>
            </div>
            <Tabs defaultValue="jd" className="flex-1 flex flex-col w-full">
                <div className="px-4 pt-3">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="jd" className="text-xs">
                            <Briefcase className="w-3.5 h-3.5 mr-2" />
                            채용 공고 (JD)
                        </TabsTrigger>
                        <TabsTrigger value="resume" className="text-xs">
                            <FileText className="w-3.5 h-3.5 mr-2" />
                            내 이력서
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="jd" className="flex-1 p-0 m-0 relative">
                    <ScrollArea className="h-[320px] w-full p-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                            {jdText}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="resume" className="flex-1 p-0 m-0 relative">
                     <ScrollArea className="h-[320px] w-full p-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                            {resumeText}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}

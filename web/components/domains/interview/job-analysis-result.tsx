"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, Briefcase, ChevronRight } from "lucide-react";
import { MOCK_JOB_ANALYSIS } from "@/mocks/interview-data";

interface JobAnalysisResultProps {
  onNext: () => void;
}

export function JobAnalysisResult({ onNext }: JobAnalysisResultProps) {
  const { company, position, qualifications, preferences, techStack, process } = MOCK_JOB_ANALYSIS;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold">{position}</h2>
           <p className="text-muted-foreground text-lg">{company}</p>
        </div>
        <Button onClick={onNext} size="lg" className="w-full md:w-auto">
           면접 준비하러 가기 <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-5 w-5 text-indigo-500" /> 자격요건
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {qualifications.map((item, idx) => (
                        <li key={idx} className="text-sm leading-relaxed flex items-start gap-2">
                             <span className="bg-indigo-100 text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] mt-0.5 shrink-0">{idx + 1}</span>
                             {item}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Star className="h-5 w-5 text-amber-500" /> 우대사항
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {preferences.map((item, idx) => (
                        <li key={idx} className="text-sm leading-relaxed flex items-start gap-2">
                             <span className="bg-amber-100 text-amber-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] mt-0.5 shrink-0">+</span>
                             {item}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                주요 기술 스택 및 채용 프로세스
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
                {techStack.map(tech => (
                    <Badge key={tech} variant="secondary" className="px-3 py-1">{tech}</Badge>
                ))}
            </div>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <span className="font-medium text-foreground">채용 절차:</span> {process}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, User, Sparkles } from "lucide-react";
import { MOCK_INTERVIEW_QUESTIONS } from "@/mocks/interview-data";
import { useRouter } from "next/navigation";
import { FeedbackReport } from "@/components/features/interview/result/feedback-report";

export default function PreQnAPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("hard");
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false); // To toggle the full report view

  const questions = activeTab === "hard" ? MOCK_INTERVIEW_QUESTIONS.hardSkills : MOCK_INTERVIEW_QUESTIONS.softSkills;

  const toggleQuestion = (id: number) => {
    if (expandedQuestionId === id) {
        setExpandedQuestionId(null);
    } else {
        setExpandedQuestionId(id);
    }
  };

  const handleAnswerChange = (id: number, text: string) => {
    setAnswers(prev => ({ ...prev, [id]: text }));
  };

  const submitAnswer = (id: number) => {
    if (!answers[id] || answers[id].trim().length < 10) {
        // allowing empty for demo purpose based on reference "no answer provided"
        // alert("답변을 10자 이상 입력해주세요.");
        // return;
    }

    setIsAnalyzing(true);
    // Simulate AI delay
    setTimeout(() => {
        setIsAnalyzing(false);
        setShowFullReport(true); // Show the reference style report
    }, 1500);
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold">면접 사전 Q&A</h1>
            <p className="text-muted-foreground">AI가 추출한 핵심 질문에 답변하고 상세 피드백을 받아보세요.</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>뒤로가기</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Question List */}
          <div className="lg:col-span-1 space-y-6">
            <Tabs defaultValue="hard" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="hard">직무 역량</TabsTrigger>
                    <TabsTrigger value="soft">인성/태도</TabsTrigger>
                </TabsList>

                <div className="space-y-3">
                    {questions.map((q) => (
                        <Card
                            key={q.id}
                            className={`cursor-pointer transition-all hover:border-indigo-400 ${expandedQuestionId === q.id ? 'border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                            onClick={() => toggleQuestion(q.id)}
                        >
                            <div className="p-4">
                                <Badge variant="outline" className="mb-2 text-[10px] text-muted-foreground">{q.category}</Badge>
                                <h3 className="text-sm font-medium line-clamp-3">{q.question}</h3>
                            </div>
                        </Card>
                    ))}
                </div>
            </Tabs>
          </div>

          {/* Right: Interaction Area */}
          <div className="lg:col-span-2 space-y-6">
             {expandedQuestionId ? (
                 <Card className="min-h-[500px] flex flex-col">
                     <div className="p-6 border-b">
                          <span className="text-sm font-bold text-indigo-600 mb-2 block">Q. 선택된 질문</span>
                          <h2 className="text-xl font-bold leading-relaxed">
                              {questions.find(q => q.id === expandedQuestionId)?.question}
                          </h2>
                     </div>

                     <div className="p-6 flex-1 flex flex-col gap-4">
                         {!showFullReport ? (
                             <>
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <User className="w-4 h-4" /> 나의 답변 작성
                                </label>
                                <Textarea
                                    placeholder="면접관 앞에서 이야기하듯 답변을 작성해보세요. (작성하지 않고 피드백만 확인할 수도 있습니다)"
                                    className="flex-1 min-h-[200px] resize-none text-lg p-4 leading-relaxed"
                                    value={answers[expandedQuestionId] || ""}
                                    onChange={(e) => handleAnswerChange(expandedQuestionId, e.target.value)}
                                />
                                <div className="flex justify-end pt-4">
                                    <Button size="lg" onClick={() => submitAnswer(expandedQuestionId)} disabled={isAnalyzing} className="w-full sm:w-auto">
                                        {isAnalyzing ? (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2 animate-spin" /> 분석 중...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" /> AI 피드백 받기
                                            </>
                                        )}
                                    </Button>
                                </div>
                             </>
                         ) : (
                             <div className="animate-in fade-in">
                                 <div className="flex justify-between items-center mb-4">
                                     <h3 className="text-lg font-bold flex items-center gap-2">
                                         <Sparkles className="w-5 h-5 text-indigo-500" /> AI 분석 리포트
                                     </h3>
                                     <Button variant="outline" size="sm" onClick={() => setShowFullReport(false)}>
                                         다시 답변하기
                                     </Button>
                                 </div>

                                 {/* Reference Style Report */}
                                 <FeedbackReport />
                             </div>
                         )}
                     </div>
                 </Card>
             ) : (
                 <div className="h-full min-h-[400px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/20">
                     <Sparkles className="w-12 h-12 mb-4 text-indigo-300" />
                     <p className="text-lg font-medium">질문을 선택하여 답변 연습을 시작하세요</p>
                     <p className="text-sm">왼쪽 리스트에서 질문을 클릭하면 답변 입력창이 나타납니다.</p>
                 </div>
             )}
          </div>
      </div>
    </div>
  );
}

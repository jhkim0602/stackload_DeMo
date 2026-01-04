"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Link as LinkIcon, Upload, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface JobUrlInputProps {
  onSubmit: (url: string, resumeData?: any) => void;
  isAnalyzing: boolean;
}

export function JobUrlInput({ onSubmit, isAnalyzing }: JobUrlInputProps) {
  const [url, setUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [activeTab, setActiveTab] = useState("file");

  const handleSubmit = () => {
    if (!url) return;
    // Simulate passing resume data along with URL
    onSubmit(url, { file: resumeFile, text: resumeText });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-muted/40">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">채용공고 분석</CardTitle>
        <CardDescription>
          지원하려는 채용공고의 URL을 입력하면 AI가 주요 자격요건과 우대사항을 분석합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            채용공고 URL <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="https://www.wanted.co.kr/wd/..."
                className="pl-9"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none block mb-2">
            이력서 / 자기소개서 (선택)
          </label>
          <Tabs defaultValue="file" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">파일 업로드 (PDF/IMG)</TabsTrigger>
              <TabsTrigger value="text">텍스트 직접 입력</TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="mt-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer relative">
                <Input
                   type="file"
                   accept=".pdf,.png,.jpg,.jpeg"
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   onChange={handleFileChange}
                />
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    {resumeFile ? (
                        <>
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                            <p className="font-medium text-foreground">{resumeFile.name}</p>
                            <p className="text-xs">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-8 w-8" />
                            <p className="font-medium">이력서 파일을 드래그하거나 클릭하여 업로드하세요</p>
                            <p className="text-xs">PDF, PNG, JPG 형식 지원 (최대 10MB)</p>
                        </>
                    )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="text" className="mt-4">
              <Textarea
                placeholder="이력서나 자기소개서 내용을 여기에 붙여넣어 주세요."
                className="min-h-[150px]"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </TabsContent>
          </Tabs>
        </div>

        <Button
            className="w-full h-12 text-lg"
            onClick={handleSubmit}
            disabled={!url || isAnalyzing}
        >
            {isAnalyzing ? "분석 중입니다..." : "분석 시작하기"}
        </Button>

        {isAnalyzing && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-pulse">
                <span>채용공고를 상세하게 분석하고 있습니다... (약 3초 소요)</span>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

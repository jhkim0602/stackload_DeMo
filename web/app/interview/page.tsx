import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Video, Settings, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function InterviewDashboard() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">AI Tech Interview</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Practice technical interviews with our AI avatar.
          Get real-time feedback on your answers and improve your communication skills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Quick Start Card */}
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 border-indigo-200 dark:border-indigo-900">
          <CardHeader>
            <CardTitle className="text-2xl text-indigo-700 dark:text-indigo-400">Quick Start</CardTitle>
            <CardDescription>Start a general technical interview session immediately.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1"><Mic className="w-4 h-4"/> Voice Enabled</div>
                <div className="flex items-center gap-1"><Video className="w-4 h-4"/> Avatar Video</div>
              </div>
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/interview/room">
                  <PlayCircle className="mr-2 w-5 h-5"/>
                  Enter Interview Room
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Setup your microphone and camera.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button variant="outline" className="w-full justify-start">
               <Settings className="mr-2 w-4 h-4" /> Device Settings
             </Button>
             <Button variant="outline" className="w-full justify-start">
               History & Feedback
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

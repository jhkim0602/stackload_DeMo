"use client";

import { useWorkspaceStore } from "../../store/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CalendarClock, Target } from "lucide-react";

interface ProjectHeroProps {
  projectId: string;
}

export function ProjectHero({ projectId }: ProjectHeroProps) {
  const { projects } = useWorkspaceStore();
  const project = projects.find(p => p.id === projectId);

  if (!project) return null;

  const dDay = project.dDay
    ? Math.ceil((new Date(project.dDay).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-primary/5 to-background border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
               <div className="flex items-center gap-2">
                 <Badge variant="outline" className="bg-background">{project.type}</Badge>
                 {project.status === 'live' && <Badge className="bg-green-500 hover:bg-green-600">LIVE</Badge>}
               </div>
               <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
               <p className="text-muted-foreground max-w-2xl">{project.description}</p>
            </div>

            {project.externalLink && (
              <Button variant="outline" className="gap-2" asChild>
                <a href={project.externalLink.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  {project.externalLink.title}
                </a>
              </Button>
            )}
          </div>

          <div className="flex gap-4 min-w-[200px]">
             {dDay !== null && (
               <div className="flex-1 bg-background rounded-xl border p-4 flex flex-col items-center justify-center text-center shadow-sm">
                  <CalendarClock className="h-6 w-6 text-orange-500 mb-2" />
                  <div className="text-2xl font-bold text-orange-600">D-{dDay}</div>
                  <div className="text-xs text-muted-foreground">Days Remaining</div>
               </div>
             )}
             <div className="flex-1 bg-background rounded-xl border p-4 flex flex-col items-center justify-center text-center shadow-sm">
                <Target className="h-6 w-6 text-blue-500 mb-2" />
                <div className="text-2xl font-bold text-blue-600">Goal</div>
                <div className="text-xs text-muted-foreground">MVP Release</div>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

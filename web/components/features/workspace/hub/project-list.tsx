"use client";

import { useWorkspaceStore } from "../store/mock-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProjectList() {
  const { projects } = useWorkspaceStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'hackathon': return "default"; // blue-ish usually
      case 'study': return "secondary";
      case 'side-project': return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">워크스페이스</h2>
          <p className="text-muted-foreground">
            협업 중인 프로젝트를 한눈에 관리하세요.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          새 워크스페이스
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link href={`/workspace/${project.id}`} key={project.id}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={getBadgeVariant(project.type) as any} className="uppercase text-xs font-bold">
                    {project.type}
                  </Badge>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(project.status)}`}>
                    <span className="relative flex h-2 w-2">
                       <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${project.status === 'live' ? 'bg-green-500' : 'hidden'}`}></span>
                       <span className={`relative inline-flex rounded-full h-2 w-2 ${project.status === 'live' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    </span>
                    {project.status === 'live' ? 'Live' : 'Closed'}
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex -space-x-2">
                    {project.members.map((member, i) => (
                      <Avatar key={i} className="h-8 w-8 border-2 border-background">
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-background bg-muted text-xs font-medium">
                      +
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 border-t bg-muted/20 p-4 flex justify-between items-center text-xs text-muted-foreground mt-auto">
                 <div className="flex items-center gap-1">
                   <Clock className="h-3 w-3" />
                   {project.lastActive}
                 </div>
                 {project.dDay && (
                   <span className="font-medium text-orange-500">D-{Math.ceil((new Date(project.dDay).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}</span>
                 )}
              </CardFooter>
            </Card>
          </Link>
        ))}

        {/* New Project Placeholder */}
        <button className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors h-[280px]">
           <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
             <Plus className="h-6 w-6" />
           </div>
           <div className="text-center">
             <span className="font-medium block">새 프로젝트 만들기</span>
             <span className="text-xs opacity-70">팀원을 초대하고 협업을 시작하세요</span>
           </div>
        </button>
      </div>
    </div>
  );
}

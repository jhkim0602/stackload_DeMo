"use client";

import { useWorkspaceStore } from "../../store/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, ArrowRight, Circle } from "lucide-react";
import { parseISO, format, isAfter, startOfToday } from "date-fns";

interface UpcomingEventsProps {
  projectId: string;
}

export function UpcomingEvents({ projectId }: UpcomingEventsProps) {
  const { tasks } = useWorkspaceStore();

  // Filter tasks with future due dates
  const today = startOfToday();
  const upcomingTasks = tasks
    .filter(t => t.projectId === projectId && t.dueDate && t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  return (
    <Card className="h-full flex flex-col">
       <CardHeader className="flex flex-row items-center justify-between pb-2">
         <div className="space-y-1">
            <CardTitle className="text-base">Upcoming Schedule</CardTitle>
            <CardDescription>Tasks due soon</CardDescription>
         </div>
         <Button variant="ghost" size="sm" className="gap-1 text-xs">
            View Calendar <ArrowRight className="h-3 w-3" />
         </Button>
       </CardHeader>
       <CardContent className="flex-1">
         {upcomingTasks.length > 0 ? (
           <div className="space-y-4">
              {upcomingTasks.map(task => (
                 <div key={task.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 border">
                    <div className="flex flex-col items-center min-w-[3rem] p-1 bg-background rounded border text-xs">
                       <span className="text-muted-foreground uppercase">{format(parseISO(task.dueDate!), 'MMM')}</span>
                       <span className="text-lg font-bold">{format(parseISO(task.dueDate!), 'd')}</span>
                    </div>
                    <div>
                       <div className="font-medium text-sm line-clamp-1">{task.title}</div>
                       <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className={`px-1.5 py-0.5 rounded capitalize bg-muted ${
                             task.status === 'in-progress' ? 'text-blue-500 bg-blue-500/10' : ''
                          }`}>
                             {task.status.replace('-', ' ')}
                          </span>
                          <span>•</span>
                          <span>Assigned to {task.assignee || 'Unassigned'}</span>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
         ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
               <CalendarDays className="h-8 w-8 mb-2 opacity-20" />
               <p className="text-sm">No upcoming deadlines.</p>
            </div>
         )}
       </CardContent>
    </Card>
  );
}

"use client";

import { useWorkspaceStore, Task } from "../../store/mock-data";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { AdvancedTaskModal } from "../board/advanced-task-modal";
import { useState } from "react";
import { Card } from "@/components/ui/card";

interface DashboardCalendarProps {
  projectId: string;
}

export function DashboardCalendar({ projectId }: DashboardCalendarProps) {
  const { tasks } = useWorkspaceStore();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Filter tasks with dueDate and belongs to project
  const events = tasks
    .filter(t => t.projectId === projectId && t.dueDate)
    .map(t => ({
       id: t.id,
       title: t.title,
       date: t.dueDate,
       backgroundColor: t.status === 'done' ? '#10b981' : t.status === 'in-progress' ? '#3b82f6' : '#6b7280',
       borderColor: 'transparent',
       extendedProps: { status: t.status }
    }));

  const handleEventClick = (info: any) => {
     setEditingTaskId(info.event.id);
  };

  return (
    <div className="h-full flex flex-col">
       <Card className="flex-1 p-2 shadow-sm border-none bg-background h-full overflow-hidden">
          <div className="h-full w-full calendar-wrapper-dashboard">
             <FullCalendar
               plugins={[dayGridPlugin, interactionPlugin]}
               initialView="dayGridMonth"
               events={events}
               eventClick={handleEventClick}
               headerToolbar={{
                 left: 'prev,next today',
                 center: 'title',
                 right: 'dayGridMonth,dayGridWeek'
               }}
               height="100%"
               dayMaxEvents={true}
             />
          </div>
       </Card>

       <AdvancedTaskModal
         taskId={editingTaskId}
         open={!!editingTaskId}
         onOpenChange={(open) => !open && setEditingTaskId(null)}
       />

       <style jsx global>{`
         .calendar-wrapper-dashboard .fc-toolbar-title { font-size: 1rem !important; font-weight: 700; }
         .calendar-wrapper-dashboard .fc-button {
             background-color: transparent;
             color: hsl(var(--foreground));
             border: 1px solid hsl(var(--border));
             box-shadow: none;
             padding: 0.25rem 0.5rem;
             font-size: 0.75rem;
         }
         .calendar-wrapper-dashboard .fc-button:hover {
             background-color: hsl(var(--muted));
             color: hsl(var(--foreground));
         }
         .calendar-wrapper-dashboard .fc-button-primary:not(:disabled).fc-button-active {
             background-color: hsl(var(--primary));
             color: hsl(var(--primary-foreground));
         }
         .calendar-wrapper-dashboard .fc-header-toolbar {
             margin-bottom: 0.5rem !important;
         }
       `}</style>
    </div>
  );
}

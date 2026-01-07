"use client";

import { useWorkspaceStore, Task, CustomFieldConfig } from "../../store/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Calendar as CalendarIcon, Pen, User, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  customFields: CustomFieldConfig[];
  isOverlay?: boolean;
  showTags?: boolean;
  showAssignee?: boolean;
  showBadges?: boolean;
  showDueDate?: boolean;
  cardProperties?: string[];
  dragHandleProps?: any;
  onEdit?: () => void;
}

export function TaskCard({
  task,
  customFields,
  isOverlay,
  showTags = true,
  showAssignee = true,
  showBadges = true,
  showDueDate = true,
  cardProperties,
  dragHandleProps,
  onEdit
}: TaskCardProps) {
  const { tags, deleteTask } = useWorkspaceStore();

  // Default order if not provided
  const propertyOrder = cardProperties || ['badges', 'tags', 'title', 'assignee', 'dueDate'];

  const renderProperty = (prop: string, index: number) => {
     const key = `${prop}-${index}`;
     switch(prop) {
        case 'badges':
           if (!showBadges) return null;
           return (
              <div key={key} className="flex flex-wrap gap-1.5 mb-1.5 min-h-[0px]">
                 {task.customFieldValues?.map((val, idx) => {
                    const field = customFields.find(f => f.id === val.fieldId);
                    if (!field || field.type !== 'select') return null;
                    const color = val.value === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-700 border-slate-100';
                    return <Badge key={idx} variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-normal ${color}`}>{val.value}</Badge>;
                 })}
              </div>
           );
        case 'tags':
           if (!showTags) return null;
           if (!task.tags || task.tags.length === 0) return null;
           return (
              <div key={key} className="flex items-center gap-1 flex-wrap mb-1.5">
                 {task.tags.map(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    if (!tag) return null;
                    const softColorClass = tag.color.replace('500', '100').replace('bg-', 'bg-');
                    const textClass = tag.color.replace('bg-', 'text-').replace('500', '700');
                    return (
                       <Badge
                          key={tag.id}
                          variant="secondary"
                          className={cn(
                             "text-[10px] px-1.5 py-0.5 h-auto font-medium rounded-md border-0 pointer-events-none",
                             softColorClass,
                             textClass
                          )}
                       >
                          {tag.name}
                       </Badge>
                    );
                 })}
              </div>
           );
        case 'assignee':
           if (!showAssignee || !task.assignee) return null;
           return (
               <div key={key} className="flex items-center gap-1.5 bg-muted/40 px-1.5 py-0.5 rounded text-[11px] mb-1.5 inline-flex w-fit">
                  <Avatar className="h-3.5 w-3.5">
                    <AvatarFallback className="text-[8px]">{task.assignee.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{task.assignee}</span>
               </div>
           );
        case 'dueDate':
           if (!showDueDate || !task.dueDate) return null;
           return (
              <div key={key} className={`flex items-center text-xs mb-1.5 ${new Date(task.dueDate) < new Date() ? 'text-orange-500 font-medium' : 'text-muted-foreground'}`}>
                 <CalendarIcon className="h-3 w-3 mr-1" />
                 {new Date(task.dueDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
              </div>
           );
        case 'title':
            return (
                <div key={key} className="text-sm font-medium leading-normal text-card-foreground line-clamp-2 w-full mb-1.5">
                {task.title}
                </div>
            );
        default: return null;
     }
  };

  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  // Determine drag handle color based on First Tag
  const firstTagId = task.tags?.[0];
  const firstTag = firstTagId ? tags.find(t => t.id === firstTagId) : undefined;

  const accentColor = firstTag
    ? firstTag.color.replace('bg-', 'bg-').replace('text-', 'bg-').replace('100', '500').replace('50', '500') // Try to convert light tag bg to solid color
    : 'bg-primary/20 hover:bg-primary/40';

  // Fallback for Notion colors usually like 'bg-orange-100 text-orange-700' -> we want 'bg-orange-500'
  // Or if it is 'bg-red-500', it stays 'bg-red-500'.
  // Simple heuristic:
  const getSolidColor = (colorClass: string) => {
      if (!colorClass) return 'bg-primary/20';
      // Extract color name (e.g. 'red', 'blue')
      const match = colorClass.match(/(?:bg|text)-([a-z]+)-/);
      if (match && match[1]) {
          return `bg-${match[1]}-500`;
      }
      return colorClass; // default fallback
  };

  const currentAccent = firstTag ? getSolidColor(firstTag.color) : 'bg-primary/20 hover:bg-primary/40';

  return (
    <Card className={`cursor-pointer hover:shadow-md transition-all shadow-sm border-muted-foreground/10 group bg-card relative overflow-hidden ${isOverlay ? 'cursor-grabbing shadow-xl rotate-2 scale-105' : ''}`}>
      {/* Internal Drag Handle (vertical bar on the left) */}
      {dragHandleProps && (
         <div
            {...dragHandleProps}
            className={cn(
               "absolute top-0 bottom-0 left-0 w-1.5 z-20 cursor-grab active:cursor-grabbing transition-all hover:w-2.5",
               currentAccent
            )}
            title="Drag to move"
            onClick={(e) => e.stopPropagation()} // Stop click propagation from handle
         />
      )}

      <CardContent className="p-3">
         {/* Task Settings Button - DropdownMenu */}
         <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:bg-muted rounded-md pointer-events-auto ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                   <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="w-48">
                 <DropdownMenuLabel>Actions</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => {
                    if (onEdit) onEdit();
                 }}>
                    <Pen className="mr-2 h-4 w-4" /> Edit Task
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => { console.log('Assignee clicked') }}>
                    <User className="mr-2 h-4 w-4" /> Change Assignee
                 </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => deleteTask(task.id)}>
                    <Trash className="mr-2 h-4 w-4" /> Delete
                 </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
         </div>

         <div className="flex flex-col items-start w-full">
            {propertyOrder.map((prop, idx) => renderProperty(prop, idx))}
         </div>

         {totalSubtasks > 0 && (
             <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 w-full mt-1">
                 <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity ml-auto">
                    <div className="flex items-center gap-0.5">
                        {/* CheckSquare icon assumed unnecessary or omitted in orig, adding simplified text */}
                        <span>{completedSubtasks}/{totalSubtasks}</span>
                    </div>
                </div>
             </div>
         )}
      </CardContent>
    </Card>
  );
}

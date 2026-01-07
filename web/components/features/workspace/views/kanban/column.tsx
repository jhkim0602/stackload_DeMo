"use client";

import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, CustomFieldConfig } from "../../store/mock-data";
import { DraggableTaskCard } from "../../modules/task/draggable-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Pen, Trash, Plus } from "lucide-react";
import { useState } from "react";

export type GroupBy = 'status' | 'assignee' | 'priority' | 'dueDate' | 'tag';

const COLUMN_COLORS = [
  'bg-gray-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
  'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500',
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

interface KanbanColumnProps {
  id: string;
  column: any;
  title: string;
  color?: string;
  tasks: Task[];
  customFields: CustomFieldConfig[];
  groupBy: GroupBy;
  icon?: string;
  onTaskClick: (id: string) => void;
  onCreateTask: () => void;
  onRename: (title: string) => void;
  onUpdate?: (updates: { title?: string, color?: string }) => void;
  onDelete: () => void;
  viewSettings: { showTags: boolean, showAssignee: boolean, showDueDate: boolean, showPriority: boolean, cardProperties?: string[] };
  isOverlay?: boolean;
  className?: string; // For overriding styles (e.g. rotation)
  category?: 'todo' | 'in-progress' | 'done';
}

export function KanbanColumn({
  id, column, title, color, tasks, customFields, groupBy, icon,
  onTaskClick, onCreateTask, onRename, onUpdate, onDelete, viewSettings,
  isOverlay, className, category
}: KanbanColumnProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: id,
    data: {
      type: 'Column',
      column: column,
    },
    disabled: !['status', 'priority', 'tag'].includes(groupBy) // Enable reordering for specific groups
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== title) {
       onRename(editTitle);
    }
    setIsEditing(false);
  };

  const handleColorChange = (newColor: string) => {
     if (onUpdate) {
        onUpdate({ color: newColor });
     }
  };

  // Extract basic color name (e.g. 'red', 'blue') from 'bg-red-500'
  const colorName = color ? color.replace('bg-', '').replace('-500', '') : 'gray';

  if (isDragging) {
     return (
        <div
           ref={setNodeRef}
           style={style}
           className={cn(
              "flex flex-col h-full w-[300px] min-w-[300px] rounded-xl border border-border/40 transition-colors duration-300 shadow-sm opacity-30",
              colorName ? `bg-${colorName}-100/40 dark:bg-${colorName}-900/20` : "bg-muted/30"
           )}
        >
            <div className="flex items-center justify-between mb-3 px-1 h-8 mt-1">
               <div className="flex items-center gap-2 w-full px-1">
                 {icon ? (
                    <Avatar className="h-5 w-5">
                       <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{icon}</AvatarFallback>
                    </Avatar>
                  ) : (
                     <div className={cn(
                        "h-2.5 w-2.5 rounded-full shrink-0",
                        category === 'todo' ? "bg-slate-500" :
                        category === 'in-progress' ? "bg-blue-500" :
                        category === 'done' ? "bg-green-500" :
                        (colorName ? `bg-${colorName}-500` : "bg-muted-foreground/30")
                     )} />
                  )}
                  <div className="flex items-center gap-2 truncate flex-1">
                       <h3 className="font-medium text-sm text-foreground/80 truncate">{title}</h3>
                       <span className="text-xs text-muted-foreground">{tasks.length}</span>
                  </div>
               </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto min-h-[100px] px-3 pb-3">
               {/* Skeleton items to mimic content */}
               {tasks.slice(0, 3).map(t => (
                   <div key={t.id} className="h-20 w-full bg-muted/20 rounded-lg border border-border/10" />
               ))}
            </div>
        </div>
     );
  }



  return (
    <div
       ref={setNodeRef}
       style={style}
       className={cn(
          "flex flex-col h-full w-[300px] min-w-[300px] rounded-xl border border-border/40 transition-colors duration-300 shadow-sm",
          colorName ? `bg-${colorName}-100/40 dark:bg-${colorName}-900/20` : "bg-muted/30",
          isOverlay ? "cursor-grabbing z-50 ring-2 ring-primary/20 rotate-2 scale-105 shadow-2xl opacity-90" : "cursor-grab",
          isOverlay && className // Allow overrides
        )}
    >


       {/* Column Header - Draggable Handle */}
       <div
         className="flex items-center justify-between mb-3 px-1 h-8 mt-1 cursor-grab active:cursor-grabbing hover:bg-muted/30 rounded-md transition-colors"
         {...attributes}
         {...listeners}
       >
         <div className="flex items-center gap-2 w-full overflow-hidden px-1">
             {/* Status Dot or Avatar */}
             {icon ? (
               <Avatar className="h-5 w-5">
                 <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{icon}</AvatarFallback>
               </Avatar>
             ) : (
                <div className={cn(
                   "h-2.5 w-2.5 rounded-full shrink-0",
                   category === 'todo' ? "bg-slate-500" :
                   category === 'in-progress' ? "bg-blue-500" :
                   category === 'done' ? "bg-green-500" :
                   (colorName ? `bg-${colorName}-500` : "bg-muted-foreground/30")
                )} />
             )}

             {isEditing ? (
                <Input
                   value={editTitle}
                   onChange={(e) => setEditTitle(e.target.value)}
                   onBlur={handleRename}
                   onKeyDown={(e) => {
                      if(e.nativeEvent.isComposing) return;
                      if(e.key === 'Enter') handleRename();
                   }}
                   autoFocus
                   className="h-7 text-sm font-semibold px-1"
                   onPointerDown={e => e.stopPropagation()} // Prevent drag when editing
                />
             ) : (
                <div className="flex items-center gap-2 truncate flex-1">
                   <h3
                     className="font-medium text-sm text-foreground/80 truncate cursor-pointer hover:underline underline-offset-4 decoration-muted-foreground/30"
                     onDoubleClick={(e) => {
                        if (groupBy === 'status') {
                           setIsEditing(true);
                           e.stopPropagation(); // Prevent drag triggers on double click
                        }
                     }}
                     title={title}
                   >
                      {title}
                   </h3>
                   <span className="text-xs text-muted-foreground">{tasks.length}</span>
                </div>
             )}
         </div>

          <div className="flex items-center opacity-0 group-hover/column:opacity-100 transition-opacity gap-1" onPointerDown={e => e.stopPropagation()}>
             {groupBy === 'status' && (
                <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-56">
                      <div className="p-2">
                         <Label className="text-xs text-muted-foreground mb-2 block">상태 색상</Label>
                         <div className="flex flex-wrap gap-1">
                            {COLUMN_COLORS.map(c => (
                               <button
                                  key={c}
                                  className={cn(
                                     "w-4 h-4 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                                     c,
                                     color === c && "ring-2 ring-ring ring-offset-1 scale-110"
                                  )}
                                  onClick={() => handleColorChange(c)}
                               />
                            ))}
                            <button
                                className={cn(
                                   "w-4 h-4 rounded-full bg-muted border transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                                   !color && "ring-2 ring-ring ring-offset-1"
                                )}
                                onClick={() => handleColorChange('')}
                                title="Default"
                            />
                         </div>
                      </div>
                      <Separator className="my-1" />
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                         <Pen className="h-3 w-3 mr-2" /> 이름 변경
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">
                         <Trash className="h-3 w-3 mr-2" /> 섹션 삭제
                      </DropdownMenuItem>
                   </DropdownMenuContent>
                </DropdownMenu>
             )}
          </div>
       </div>

       {/* Column Body */}
       <div className="flex-1 space-y-3 overflow-y-auto min-h-[100px] px-3 pb-3 scrollbar-none">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map(task => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                customFields={customFields}
                onClick={() => onTaskClick(task.id)}
                {...viewSettings}
                showTags={viewSettings.showTags}
                showAssignee={viewSettings.showAssignee}

                showDueDate={viewSettings.showDueDate}
              />
            ))}
          </SortableContext>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground/50 hover:text-muted-foreground h-8 text-sm"
            onClick={onCreateTask}
          >
             <Plus className="h-3.5 w-3.5 mr-2" /> 새 태스크
          </Button>
       </div>
    </div>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, User, Tag, CheckSquare, MessageSquare, Paperclip, Clock, Trash2, MoreHorizontal, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useWorkspaceStore, Task, Tag as TagType } from "../../store/mock-data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SmartTagPicker } from "../tag/picker";

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
}

export function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const { tasks, updateTask, tags, projects } = useWorkspaceStore();
  const task = tasks.find(t => t.id === taskId);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");

  // Local state for immediate feedback
  useEffect(() => {
     if (task) {
        setTitle(task.title);
        setDescription(task.description || "");
     }
  }, [task]);

  if (!task) return null;

  const project = projects.find(p => p.id === task.projectId);
  const boardView = project?.views.find(v => v.type === 'kanban');
  const currentStatus = boardView?.columns.find(c => c.statusId === task.status);

  const members = project?.members || [];

  const handleTitleBlur = () => {
    if (title !== task.title) {
       updateTask(task.id, { title });
    }
  };

  const handleDescriptionBlur = () => {
     if (description !== task.description) {
        updateTask(task.id, { description });
     }
  };

  return (
    <Dialog open={!!taskId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[85vh] p-0 gap-0 overflow-hidden flex flex-col bg-background shadow-lg">
         <DialogHeader className="sr-only">
            <DialogTitle>Task Details</DialogTitle>
         </DialogHeader>
         {/* Header / Cover Image Area (Optional) */}
         <div className="h-14 border-b flex items-center justify-between px-4 bg-background/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <Badge variant="outline" className="font-normal bg-muted/50">{project?.title}</Badge>
               <span>/</span>
               <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className={cn("w-2 h-2 rounded-full", currentStatus?.color || "bg-slate-400")} />
                  <span>{currentStatus?.title}</span>
               </div>
            </div>
            {/* <div className="flex items-center gap-1"> // Removed More Options Button </div> */}
         </div>

         <div className="flex flex-1 overflow-hidden">
            {/* Main Content */}
            <ScrollArea className="flex-1 p-8">
               <div className="max-w-2xl mx-auto space-y-8 pb-10">

                  {/* Title Area */}
                  <div>
                     <input
                        className="w-full text-3xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/40"
                        placeholder="태스크 제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                     />
                  </div>

                  {/* Properties Grid (Notion Style) */}
                  <div className="grid grid-cols-[100px_1fr] gap-y-3 text-sm items-center">

                     {/* Assignee */}
                     <div className="text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" /> 담당자
                     </div>
                     <div className="flex items-center">
                        <Popover>
                           <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 px-1.5 -ml-1.5 font-normal hover:bg-muted text-muted-foreground hover:text-foreground">
                                 {task.assignee ? (
                                    <div className="flex items-center gap-2">
                                       <Avatar className="h-4 w-4">
                                          <AvatarFallback className="text-[9px]">{task.assignee.charAt(0)}</AvatarFallback>
                                       </Avatar>
                                       {task.assignee}
                                    </div>
                                 ) : (
                                    <span className="text-muted-foreground/50">비어 있음</span>
                                 )}
                              </Button>
                           </PopoverTrigger>
                           <PopoverContent className="w-[200px] p-0" align="start">
                              <ScrollArea className="h-60">
                                 {members.map(member => (
                                    <div
                                       key={member.id}
                                       className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer text-sm"
                                       onClick={() => updateTask(task.id, { assignee: member.name })}
                                    >
                                       <Avatar className="h-5 w-5">
                                          <AvatarFallback className="text-[10px]">{member.name.charAt(0)}</AvatarFallback>
                                       </Avatar>
                                       {member.name}
                                    </div>
                                 ))}
                              </ScrollArea>
                           </PopoverContent>
                        </Popover>
                     </div>

                     {/* Due Date */}
                     <div className="text-muted-foreground flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" /> 마감일
                     </div>
                     <div>
                        <Popover>
                           <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className={cn(
                                 "h-7 px-1.5 -ml-1.5 font-normal hover:bg-muted text-muted-foreground hover:text-foreground justify-start text-left font-normal",
                                 !task.dueDate && "text-muted-foreground/50"
                              )}>
                                 {task.dueDate ? format(new Date(task.dueDate), "PPP") : "비어 있음"}
                              </Button>
                           </PopoverTrigger>
                           <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                 mode="single"
                                 selected={task.dueDate ? new Date(task.dueDate) : undefined}
                                 onSelect={(date) => updateTask(task.id, { dueDate: date ? date.toISOString() : undefined })}
                                 initialFocus
                              />
                           </PopoverContent>
                        </Popover>
                     </div>

                     {/* Tags */}
                     <div className="text-muted-foreground flex items-center gap-2">
                        <Tag className="h-4 w-4" /> 태그
                     </div>
                     <div className="flex flex-wrap gap-1.5">
                        {task.tags?.map(tagId => {
                           const tag = tags.find(t => t.id === tagId);
                           if (!tag) return null;
                           return (
                              <Badge key={tag.id} variant="secondary" className={cn("font-normal px-1.5 h-6", tag.color.replace('500', '100'), tag.color.replace('bg-', 'text-').replace('500', '700'))}>
                                 {tag.name}
                                 <X
                                    className="h-3 w-3 ml-1 cursor-pointer opacity-50 hover:opacity-100"
                                    onClick={() => useWorkspaceStore.getState().removeTagFromTask(task.id, tag.id)}
                                 />
                              </Badge>
                           );
                        })}
                        <SmartTagPicker
                           selectedTagIds={task.tags || []}
                           onToggleTag={(tagId) => {
                              const isActive = task.tags?.includes(tagId);
                              if (isActive) {
                                  useWorkspaceStore.getState().removeTagFromTask(task.id, tagId);
                              } else {
                                  useWorkspaceStore.getState().addTagToTask(task.id, tagId);
                              }
                           }}
                           trigger={
                              <Badge variant="outline" className="font-normal px-1.5 h-6 cursor-pointer hover:bg-muted border-dashed text-muted-foreground">
                                 + 추가
                              </Badge>
                           }
                        />
                     </div>
                  </div>

                  <Separator />

                  {/* Description */}
                  <div className="space-y-4">
                     <div className="font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" /> 설명
                     </div>
                     <Textarea
                        placeholder="여기에 태스크에 대한 상세 설명을 작성하세요... (Markdown 지원 예정)"
                        className="min-h-[150px] resize-none border-none focus-visible:ring-0 bg-muted/20 p-4 text-base leading-relaxed"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={handleDescriptionBlur}
                     />
                  </div>

                  {/* Subtasks Removed */}{/* Accessability / Subtasks Placeholder Removed */}

                  <div className="space-y-4">
                      <div className="font-semibold flex items-center gap-2">
                         <Paperclip className="h-4 w-4 text-muted-foreground" /> 첨부 파일
                      </div>
                      <div className="h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors">
                         파일을 드래그하여 업로드하거나 클릭하세요
                      </div>
                  </div>

               </div>
            </ScrollArea>

            {/* Sidebar (Optional - Activity Log, etc) - Hidden for now to simplify */}

         </div>

          <DialogFooter className="border-t p-2 px-4 bg-muted/20 flex justify-between items-center w-full sm:justify-between">
             <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Clock className="h-3 w-3" /> 마지막 수정: 방금 전
             </div>
             <Button size="sm" onClick={onClose}>저장</Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

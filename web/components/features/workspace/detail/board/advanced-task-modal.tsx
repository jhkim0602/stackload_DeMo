"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWorkspaceStore, Task, CustomFieldConfig } from "../../store/mock-data";
import { Calendar as CalendarIcon, FileText, Send, CheckCircle2, Clock, History, AtSign, Share2, MoreHorizontal, X, Plus } from "lucide-react";
import { useState } from "react";
import { SmartInput } from "../../common/smart-input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { SmartTagPicker } from "../../modules/tag/picker";

interface AdvancedTaskModalProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToDoc?: (docId: string) => void;
}

export function AdvancedTaskModal({ taskId, open, onOpenChange, onNavigateToDoc }: AdvancedTaskModalProps) {
  const { tasks, projects, updateTask, updateTaskStatus, addComment, addSubTask, toggleSubTask, tags, addTagToTask, removeTagFromTask } = useWorkspaceStore();
  const task = tasks.find(t => t.id === taskId);
  const project = projects.find(p => p.id === task?.projectId);

  const [commentInput, setCommentInput] = useState("");
  const [subtaskInput, setSubtaskInput] = useState("");

  const handleToggleTag = (tagId: string) => {
     if (!task) return;
     if (task.tags?.includes(tagId)) {
        removeTagFromTask(task.id, tagId);
     } else {
        addTagToTask(task.id, tagId);
     }
  };

  if (!task || !project) return null;

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    addComment(task.id, commentInput);
    setCommentInput("");
  };

  const handleAddSubTask = () => {
    if (!subtaskInput.trim()) return;
    addSubTask(task.id, subtaskInput);
    setSubtaskInput("");
  };

  // Helper to render custom field input based on type
  const renderCustomFieldInput = (field: CustomFieldConfig) => {
    const valueItem = task.customFieldValues?.find(v => v.fieldId === field.id);
    const value = valueItem?.value;

    const onUpdate = (newValue: any) => {
      const newValues = task.customFieldValues?.filter(v => v.fieldId !== field.id) || [];
      newValues.push({ fieldId: field.id, value: newValue });
      updateTask(task.id, { customFieldValues: newValues });
    };

    switch (field.type) {
      case 'select':
        return (
          <Select value={value || ''} onValueChange={onUpdate}>
             <SelectTrigger>
               <SelectValue placeholder={`Select ${field.name}`} />
             </SelectTrigger>
             <SelectContent>
               {field.options?.map(opt => (
                 <SelectItem key={opt} value={opt}>{opt}</SelectItem>
               ))}
             </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onUpdate(Number(e.target.value))}
            placeholder="0"
          />
        );
      default: // Text
        return (
          <Input
            value={value || ''}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder={field.name}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0 overflow-hidden bg-background outline-none">
         <DialogTitle className="sr-only">Task Details</DialogTitle>
         <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-2 border-b flex-shrink-0">
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs uppercase">
                      {project.title.substring(0, 3)}-{task.id.split('-')[1]}
                    </Badge>

                    {/* Status & Tags */}
                    <div className="flex items-center gap-2">
                       <Select defaultValue={task.status} onValueChange={(v: any) => updateTaskStatus(task.id, v)}>
                          <SelectTrigger className="h-7 w-[130px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">할 일</SelectItem>
                            <SelectItem value="in-progress">진행 중</SelectItem>
                            <SelectItem value="done">완료</SelectItem>
                          </SelectContent>
                       </Select>

                       {/* Tag Badges */}
                       {task.tags?.map(tagId => {
                           const tag = tags.find(t => t.id === tagId);
                           if (!tag) return null;
                           return (
                              <Badge key={tag.id} variant="outline" className={cn("h-6 border-0 text-white px-2 gap-1 rounded-md", tag.color)}>
                                 {tag.name}
                                 <button
                                    onClick={(e) => { e.stopPropagation(); removeTagFromTask(task.id, tag.id); }}
                                    className="hover:bg-black/10 rounded-full p-0.5 ml-0.5"
                                 >
                                    <X className="h-2.5 w-2.5" />
                                 </button>
                              </Badge>
                           );
                       })}

                          <SmartTagPicker
                             selectedTagIds={task.tags}
                             onToggleTag={handleToggleTag}
                             trigger={
                                <Button variant="outline" size="sm" className="h-8 border-dashed gap-1.5 ml-1 text-muted-foreground hover:text-foreground">
                                   <Plus className="h-3.5 w-3.5" />
                                   태그 추가
                                </Button>
                             }
                          />
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                     <X className="h-4 w-4" />
                  </Button>
               </div>

               <Input
                  value={task.title}
                  onChange={(e) => updateTask(task.id, { title: e.target.value })}
                  className="text-2xl font-bold border-none shadow-none px-0 focus-visible:ring-0 h-auto placeholder:text-muted-foreground/50"
                  placeholder="태스크 제목"
               />
            </div>

            {/* Tabs Content - Scrollable */}
            <ScrollArea className="flex-1">
              <Tabs defaultValue="general" className="w-full">
                <div className="px-6 border-b sticky top-0 bg-background z-10 pt-2">
                   <TabsList className="bg-transparent -ml-2">
                      <TabsTrigger value="general" className="data-[state=active]:bg-muted">일반</TabsTrigger>
                      <TabsTrigger value="subtasks" className="data-[state=active]:bg-muted">
                         하위 태스크 <span className="ml-2 text-xs bg-muted-foreground/20 px-1.5 rounded-full">{task.subtasks?.length || 0}</span>
                      </TabsTrigger>
                      <TabsTrigger value="comments" className="data-[state=active]:bg-muted">
                         댓글 <span className="ml-2 text-xs bg-muted-foreground/20 px-1.5 rounded-full">{task.comments?.length || 0}</span>
                      </TabsTrigger>
                      <TabsTrigger value="history" className="data-[state=active]:bg-muted">기록</TabsTrigger>
                   </TabsList>
                </div>

                <div className="p-6">
                   <TabsContent value="general" className="space-y-6 mt-0">
                      {/* Description */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase">설명</Label>
                        <Textarea
                          className="min-h-[120px] resize-none"
                          placeholder="상세 설명을 추가하세요..."
                          value={task.description || ''}
                          onChange={(e) => updateTask(task.id, { description: e.target.value })}
                        />
                      </div>

                      {/* Standard Fields Grid */}
                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase">담당자</Label>
                            <Select defaultValue={task.assignee || "unassigned"} onValueChange={(v) => updateTask(task.id, { assignee: v })}>
                               <SelectTrigger>
                                 <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5"><AvatarFallback>{task.assignee ? task.assignee.charAt(0) : '?'}</AvatarFallback></Avatar>
                                    <span>{task.assignee || '미지정'}</span>
                                 </div>
                               </SelectTrigger>
                               <SelectContent>
                                  <SelectItem value="unassigned">미지정</SelectItem>
                                  {project.members.map(m => (
                                     <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                                  ))}
                               </SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase">마감일</Label>
                            <div className="relative">
                              <Input
                                type="date"
                                value={task.dueDate || ''}
                                onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                              />
                            </div>
                         </div>
                      </div>

                      {/* Custom Fields Grid */}
                      {project.customFields && project.customFields.length > 0 && (
                         <div className="space-y-3 pt-4 border-t">
                            <Label className="text-xs font-bold text-muted-foreground uppercase">프로젝트 필드</Label>
                            <div className="grid grid-cols-2 gap-6">
                               {project.customFields.map(field => (
                                  <div key={field.id} className="space-y-2">
                                     <Label className="text-sm font-medium">{field.name}</Label>
                                     {renderCustomFieldInput(field)}
                                  </div>
                               ))}
                            </div>
                         </div>
                      )}

                      {/* Linked Doc */}
                      {task.docRef && (
                         <div className="pt-4 border-t">
                            <div className="p-3 border rounded-lg bg-muted/20 flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm font-medium">사양서</span>
                               </div>
                               <Button variant="ghost" size="sm" onClick={() => {
                                  onOpenChange(false);
                                  onNavigateToDoc?.(task.docRef!);
                               }}>열기</Button>
                            </div>
                         </div>
                      )}
                   </TabsContent>

                   <TabsContent value="subtasks" className="space-y-4 mt-0">
                      <div className="flex gap-2">
                         <Input
                            value={subtaskInput}
                            onChange={(e) => setSubtaskInput(e.target.value)}
                            placeholder="Add a subtask..."
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask()}
                         />
                         <Button size="icon" onClick={handleAddSubTask}><CheckCircle2 className="h-4 w-4" /></Button>
                      </div>
                      <div className="space-y-2">
                         {task.subtasks?.map(st => (
                            <div key={st.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded group">
                               <Checkbox checked={st.completed} onCheckedChange={() => toggleSubTask(task.id, st.id)} />
                               <span className={st.completed ? "line-through text-muted-foreground" : ""}>{st.title}</span>
                            </div>
                         ))}
                         {(!task.subtasks || task.subtasks.length === 0) && (
                            <div className="text-center py-8 text-muted-foreground text-sm">하위 태스크가 없습니다.</div>
                         )}
                      </div>
                   </TabsContent>

                   <TabsContent value="comments" className="space-y-4 mt-0">
                      <div className="space-y-4 mb-4">
                         {task.comments?.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                               <Avatar className="h-8 w-8 mt-1">
                                  <AvatarFallback>U</AvatarFallback>
                               </Avatar>
                               <div className="bg-muted/30 p-3 rounded-lg flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                     <span className="font-semibold text-sm">User</span>
                                     <span className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleTimeString()}</span>
                                  </div>
                                  <p className="text-sm">{comment.content}</p>
                               </div>
                            </div>
                         ))}
                      </div>
                       <div className="flex gap-2 sticky bottom-0 bg-background pt-2 items-end">
                          <div className="flex-1 relative">
                            <SmartInput
                               value={commentInput}
                               onChange={setCommentInput}
                               onEnter={handleAddComment}
                               placeholder="댓글을 입력하세요... (@로 멘션)"
                               className="pr-10"
                            />
                             <Button
                               variant="ghost"
                               size="icon"
                               onClick={() => setCommentInput(prev => prev + '@')}
                               className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                             >
                               <AtSign className="h-4 w-4" />
                             </Button>
                          </div>
                          <Button size="icon" onClick={handleAddComment}><Send className="h-4 w-4" /></Button>
                       </div>
                   </TabsContent>

                   <TabsContent value="history" className="mt-0">
                      <div className="space-y-4 border-l-2 border-muted pl-4 ml-2 py-2">
                         {task.history?.map(log => (
                            <div key={log.id} className="relative">
                               <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-muted border-2 border-background" />
                               <p className="text-sm">
                                  <span className="font-medium">User</span> {log.action}
                               </p>
                               <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                         ))}
                         {(!task.history || task.history.length === 0) && (
                            <div className="text-sm text-muted-foreground">최근 활동이 없습니다.</div>
                         )}
                      </div>
                   </TabsContent>
                </div>
              </Tabs>
            </ScrollArea>
         </div>
      </DialogContent>
    </Dialog>
  );
}

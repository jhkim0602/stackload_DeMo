
"use client";

import { useWorkspaceStore, Task, TaskStatus, CustomFieldConfig, ViewColumn } from "../store/mock-data";
import { DndContext, DragOverlay, useDraggable, useDroppable, closestCorners, DragStartEvent, DragEndEvent, useSensors, useSensor, PointerSensor, KeyboardSensor, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy, useSortable, sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanColumn, GroupBy } from "../views/kanban/column";
import { TaskCard } from "../modules/task/card";
import { TaskDetailModal } from "../modules/task/detail-modal";
import { DraggablePropertySettings } from "../modules/view-settings/property-settings";
import { useKanbanDrag } from "../views/kanban/hooks/use-kanban-drag";
import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// AdvancedTaskModal import removed
import { SmartTagPicker } from "../modules/tag/picker";
import { Plus, MessageSquare, CheckSquare, MoreHorizontal, Pen, Trash, Users, KanbanSquare, Settings2, Layout, PlusCircle, List, Calendar as CalendarIcon, Tag as TagIcon, GripVertical, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal, Eye, Filter } from "lucide-react";

interface KanbanBoardProps {
  projectId: string;
  onNavigateToDoc?: (docId: string) => void;
}

// type GroupBy is imported from ../views/kanban/column

// --- Helper Component for Property Settings ---

// DraggablePropertySettings moved to ../modules/view-settings/property-settings

export function KanbanBoard({ projectId, onNavigateToDoc }: KanbanBoardProps) {
  const { tasks, projects, createTask, updateTaskStatus, updateTask, addColumnToView, renameColumnInView, deleteColumnFromView, updateColumnInView, moveColumnInView, tags, updateViewCardProperties, activeTaskId, setActiveTaskId } = useWorkspaceStore();
  const project = projects.find(p => p.id === projectId);

  // View Settings State
  const [showTags, setShowTags] = useState(true);
  const [showAssignee, setShowAssignee] = useState(true);
  const [showBadges, setShowBadges] = useState(true);
  const [showDueDate, setShowDueDate] = useState(true);
  const [filterTagIds, setFilterTagIds] = useState<string[]>([]);

  // useKanbanDrag hook replaces activeId, activeColumn, and handlers
  // useKanbanDrag hook will be called after columns definition

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>('status');

  // Initialize activeViewId with the first view's ID
  const [activeViewId, setActiveViewId] = useState<string>(
     project?.views[0]?.id || ''
  );

  // Active View Logic
  const activeView = useMemo(() => {
     if (!project) return null;
     return project.views.find(v => v.id === activeViewId) || project.views[0];
  }, [project, activeViewId]);

  // Helper Functions for Tab Visualization
  const getViewColor = (type: string) => {
     switch (type) {
        case 'kanban': return 'bg-blue-500';
        case 'list': return 'bg-green-500';
        case 'calendar': return 'bg-orange-500';
        default: return 'bg-gray-500';
     }
  };

  const getViewIcon = (type: string) => {
     switch (type) {
        case 'kanban': return <KanbanSquare className="h-5 w-5 text-white" />;
        case 'list': return <List className="h-5 w-5 text-white" />;
        case 'calendar': return <CalendarIcon className="h-5 w-5 text-white" />;
        default: return <Layout className="h-5 w-5 text-white" />;
     }
  };

  // Derive Columns based on GroupBy state
  const columns = useMemo(() => {
    if (!project) return [];
    if (groupBy === 'status') {
       // Use columns from the Active View
       return activeView?.columns || [];
    } else {
      const memberColumns = project.members.map(m => ({ id: m.id, title: m.name, avatar: m.avatar }));
      return [
        { id: 'unassigned', title: 'Unassigned', avatar: '?' },
        ...memberColumns
      ];
    }
  }, [project, groupBy, activeView]);

  const columnIds = useMemo(() => columns.map(c => c.id), [columns]);

  // Filter Tasks
  const projectTasks = tasks.filter(t => {
     if (t.projectId !== projectId) return false;
     // Apply Tag Filter
     if (filterTagIds.length > 0) {
        if (!t.tags || t.tags.length === 0) return false;
        // Match ANY selected tag (OR logic) - or change to AND if preferred
        const hasTag = t.tags.some(tagId => filterTagIds.includes(tagId));
        if (!hasTag) return false;
     }
     return true;
  });

  // Handlers moved to useKanbanDrag
  const {
     activeId,
     activeColumn,
     sensors,
     handleDragStart,
     handleDragEnd,
     handleDragOver
  } = useKanbanDrag({
     columns,
     groupBy,
     activeViewId: activeView?.id || '',
     updateTaskStatus,
     updateTask,
     moveColumnInView,
     reorderTask: useWorkspaceStore(state => state.reorderTask), // Select it directly if possible or destructure above
     tasks
  });

  const handleAddColumn = () => {
    if (!newColumnTitle.trim() || !activeView) {
       setIsAddingColumn(false);
       return;
    }
    // Default: Status ID = Title converted to slug.
    // In a real app, we might check for status existence or create a new Status entity separately.
    addColumnToView(activeView.id, newColumnTitle);
    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  if (!project) return <div>Project not found</div>;

  return (
    <div className="h-full flex gap-4 overflow-hidden pr-2">
       {/* Main Board Area */}
       <div className="flex-1 flex flex-col h-full overflow-hidden bg-background rounded-2xl border shadow-sm relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
             <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {/* Show View Name based on grouping */}
                  {groupBy === 'status' ? '진행 상태 칸반보드' : '담당자별 칸반보드'}
                  <Badge variant="secondary" className="font-normal text-muted-foreground ml-2">{projectTasks.length}개</Badge>
                </h2>
                {projectTasks.length >= 450 && (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 animate-pulse">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">태스크 생성 제한(500개)에 근접했습니다 ({projectTasks.length}/500)</span>
                  </div>
                )}
             </div>

             <div className="flex items-center gap-2">
                {groupBy === 'status' && (
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="outline" size="sm" className="h-9 border-dashed">
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            새 섹션
                         </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-60 p-0">
                         <div className="p-3 border-b">
                            <h4 className="font-medium text-sm mb-2">섹션 생성</h4>
                            <div className="flex gap-2">
                               <Input
                                  value={newColumnTitle}
                                  onChange={(e) => setNewColumnTitle(e.target.value)}
                                  placeholder="e.g. Backlog"
                                  className="h-8"
                                  onKeyDown={(e) => {
                                     if(e.nativeEvent.isComposing) return;
                                     if(e.key === 'Enter') handleAddColumn();
                                  }}
                               />
                               <Button size="sm" onClick={handleAddColumn} disabled={!newColumnTitle.trim()} className="h-8">추가</Button>
                            </div>
                         </div>
                      </DropdownMenuContent>
                   </DropdownMenu>
                )}

                {/* View Options Menu (Notion-style) */}
                <Popover>
                   <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                         <Settings2 className="h-4 w-4" />
                      </Button>
                   </PopoverTrigger>
                   <PopoverContent align="end" className="w-64 p-2">
                      <div className="space-y-4">
                         {/* Properties Section */}
                         <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                               <Eye className="h-3 w-3" /> 속성 / 순서
                             </div>

                             <DraggablePropertySettings
                                properties={activeView?.cardProperties || ['badges', 'tags', 'title', 'assignee', 'dueDate']}
                                visibility={{
                                   'tags': showTags,
                                   'assignee': showAssignee,
                                   'badges': showBadges,
                                   'dueDate': showDueDate,
                                   'title': true
                                }}
                                onReorder={(newOrder) => activeView && updateViewCardProperties(activeView.id, newOrder)}
                                onToggle={(prop) => {
                                   if(prop === 'tags') setShowTags(!showTags);
                                   if(prop === 'assignee') setShowAssignee(!showAssignee);
                                   if(prop === 'badges') setShowBadges(!showBadges);
                                   if(prop === 'dueDate') setShowDueDate(!showDueDate);
                                }}
                             />
                          </div>

                         <Separator />

                         {/* Filter Section */}
                         <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                               <Filter className="h-3 w-3" /> 태그 필터
                            </div>
                            <div className="max-h-[140px] overflow-y-auto space-y-1 px-1">
                               {tags.map(tag => {
                                  const isActive = filterTagIds.includes(tag.id);
                                  return (
                                     <div
                                        key={tag.id}
                                        onClick={() => {
                                           setFilterTagIds(prev =>
                                              isActive ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                                           );
                                        }}
                                        className={cn(
                                           "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors",
                                           isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"
                                        )}
                                     >
                                        <div className={cn("w-2 h-2 rounded-full", tag.color)} />
                                        <span>{tag.name}</span>
                                        {isActive && <CheckSquare className="h-3 w-3 ml-auto opacity-50" />}
                                     </div>
                                  );
                               })}
                                {tags.length === 0 && <div className="text-xs text-muted-foreground p-1">생성된 태그가 없습니다.</div>}
                             </div>

                             <div className="pt-2 border-t mt-2">
                                <SmartTagPicker
                                   trigger={
                                      <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-7 px-2 text-muted-foreground hover:text-foreground">
                                         <Settings2 className="h-3 w-3 mr-2" /> 태그 관리
                                      </Button>
                                   }
                                />
                             </div>
                         </div>
                      </div>
                   </PopoverContent>
                </Popover>
             </div>
          </div>

          <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} collisionDetection={closestCorners} sensors={sensors}>
            <div className="flex gap-4 h-full overflow-x-auto pb-4 items-start px-6 pt-6">
               <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                 {columns.map(col => {
                   const colTasks = projectTasks.filter(t => {
                     if (groupBy === 'status') {
                        if ('statusId' in col) {
                           return t.status === col.statusId;
                        }
                        return t.status === col.id;
                     }
                     if (col.id === 'unassigned') return !t.assignee || t.assignee === 'unassigned';
                     return t.assignee === col.title;
                   });

                   return (
                     <KanbanColumn
                       key={col.id}
                       id={col.id}
                       column={col} // Pass full column object for overlay
                       title={col.title}
                       color={('color' in col) ? col.color : undefined}
                       tasks={colTasks}
                       customFields={project.customFields || []}
                       groupBy={groupBy}
                       icon={('avatar' in col) ? col.avatar as string : undefined}
                       onTaskClick={setActiveTaskId}
                       onCreateTask={() => {
                           const defaultProps: any = { projectId, title: 'New Task', customFieldValues: [] };
                           if (groupBy === 'status') {
                              defaultProps.status = ('statusId' in col) ? col.statusId : col.id;
                           } else {
                             defaultProps.status = 'todo';
                             if (col.id !== 'unassigned') defaultProps.assignee = col.title;
                           }
                           const newTaskId = createTask(defaultProps);
                           if (newTaskId) {
                               setActiveTaskId(newTaskId);
                           }
                       }}
                       onRename={(newTitle) => activeView ? renameColumnInView(activeView.id, col.id, newTitle) : null}
                       onUpdate={(updates) => activeView ? updateColumnInView(activeView.id, col.id, updates) : null}
                       onDelete={() => activeView ? deleteColumnFromView(activeView.id, col.id) : null}
                       viewSettings={{ showTags, showAssignee, showBadges, showDueDate }}
                     />
                   );
                 })}
               </SortableContext>


            </div>

            <DragOverlay>
               {activeId ? (
                  <TaskCard
                    task={tasks.find(t => t.id === activeId)!}
                    customFields={project.customFields || []}
                     isOverlay
                     showTags={showTags}
                     showAssignee={showAssignee}
                     showBadges={showBadges}
                     showDueDate={showDueDate}
                   />
               ) : activeColumn ? (
                  <KanbanColumn
                     id={activeColumn.id}
                     column={activeColumn}
                     title={activeColumn.title}
                     color={('color' in activeColumn) ? activeColumn.color : undefined}
                     tasks={projectTasks.filter(t => {
                       if (groupBy === 'status') {
                          if ('statusId' in activeColumn) return t.status === activeColumn.statusId;
                          return t.status === activeColumn.id;
                       }
                       if (activeColumn.id === 'unassigned') return !t.assignee || t.assignee === 'unassigned';
                       return t.assignee === activeColumn.title;
                     })}
                     customFields={project.customFields || []}
                     groupBy={groupBy}
                     icon={('avatar' in activeColumn) ? activeColumn.avatar as string : undefined}
                     // Pass dummy handlers for overlay
                     onTaskClick={() => {}}
                     onCreateTask={() => {}}
                     onRename={() => {}}
                     onUpdate={() => {}}
                     onDelete={() => {}}
                     viewSettings={{ showTags, showAssignee, showBadges, showDueDate }}
                     isOverlay
                     className="rotate-2 scale-105 shadow-2xl opacity-90 ring-1 ring-primary/20"
                  />
               ) : null}
            </DragOverlay>
          </DndContext>
       </div>

       {/* Right-Side Notebook Tabs */}
       <div className="w-14 flex flex-col gap-4 pt-10">
           <NotebookTab
              label="담당자 별"
              active={groupBy === 'assignee'}
              onClick={() => setGroupBy('assignee')}
              color="bg-blue-500"
              icon={<Users className="h-5 w-5 text-white" />}
           />
           <NotebookTab
              label="진행 상태"
              active={groupBy === 'status'}
              onClick={() => setGroupBy('status')}
              color="bg-green-500"
              icon={<KanbanSquare className="h-5 w-5 text-white" />}
           />

          <NotebookTab
             label="뷰 추가"
             active={false}
             onClick={() => {
                // Placeholder for Add View logic. In real app, opens a dialog.
                const newViewId = `view-${Date.now()}`;
                // We would need an addView action in store. For now just log.
                console.log("Add View Clicked");
             }}
             color="bg-muted-foreground/20"
             icon={<PlusCircle className="h-5 w-5 text-muted-foreground" />}
          />
       </div>

       {/* AdvancedTaskModal removed (dead code) */}
    </div>
  );
}

function NotebookTab({ label, active, onClick, color, icon }: { label: string, active: boolean, onClick: () => void, color: string, icon: React.ReactNode }) {
   return (
      <div
         onClick={onClick}
         className={cn(
            "w-14 h-12 rounded-r-xl shadow-md flex items-center justify-center cursor-pointer transition-all relative group hover:w-16",
            color,
            active ? "w-16 translate-x-[-10px] z-20 shadow-lg" : "opacity-80 hover:opacity-100 z-0"
         )}
         title={label}
      >
         {icon}
         {/* Connector to simulate paper tab */}
         {active && (
            <div className={cn("absolute left-0 top-0 bottom-0 w-4 -ml-2 rounded-l-md", color)} />
         )}
      </div>
   );
}



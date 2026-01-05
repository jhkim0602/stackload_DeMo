import { useState } from "react";
import {
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ViewColumn, Task } from "../../../store/mock-data";

interface UseKanbanDragProps {
  columns: any[]; // Supports ViewColumn or Member-based columns
  groupBy: 'status' | 'assignee';
  activeViewId: string;
  reorderTask: (taskId: string, newStatus: string, newIndex: number) => void;
  tasks: Task[];
  updateTaskStatus: (taskId: string, statusId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  moveColumnInView: (viewId: string, fromIndex: number, toIndex: number) => void;
}

export function useKanbanDrag({
  columns,
  groupBy,
  activeViewId,
  updateTaskStatus,
  updateTask,
  moveColumnInView,
  reorderTask,
  tasks
}: UseKanbanDragProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<ViewColumn | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column);
      setActiveId(null);
      return;
    }
    setActiveId(event.active.id as string);
    setActiveColumn(null);
  };

  // Calculate Status from a Column ID (taking into account mapped statusId)
  const getStatusFromColumnId = (colId: string) => {
     if (groupBy !== 'status') return colId; // Assignee view uses name/id directly
     const col = columns.find(c => c.id === colId);
     if (!col) return colId;
     return ('statusId' in col) ? col.statusId : col.id;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    // Only handle Task dragging in DragOver for live preview
    if (active.data.current?.type !== 'Task') return;

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    const overTask = tasks.find(t => t.id === overId);
    const overColumn = columns.find(c => c.id === overId);

    // 1. Moving Over Another Task
    if (overTask) {
       // If Status/Group is different, move it immediately to create gap
       // Note: In Assignee view, 'status' field in Task might not be what defines column.
       // But assuming we rely on groupBy prop to interpret.
       // For now, let's stick to Status-based Grouping logic principally, or generic property check.

       const activeGroup = groupBy === 'status' ? activeTask.status : activeTask.assignee;
       const overGroup = groupBy === 'status' ? overTask.status : overTask.assignee;

       // If sorting items in DIFFERENT lists
       if (activeGroup !== overGroup) {
          // Identify new group value
          const newStatusOrAssignee = overGroup;

          // Find index
          // We need tasks in target group to find relative index
          const tasksInTarget = tasks.filter(t => {
             if (groupBy === 'status') return t.status === newStatusOrAssignee;
             return t.assignee === newStatusOrAssignee;
          });
          const overIndex = tasksInTarget.findIndex(t => t.id === overId);

          // When moving into a new list, we just insert at overIndex.
          // (dnd-kit suggests checking collision rects for precision but overIndex is usually fine for "Gap")
          // Logic: "Is overTask below or above cursor?" - dnd-kit handles sorting updates if in same container.
          // For cross-container, simple swap/insert is good start.
          if (overIndex >= 0) {
              if (groupBy === 'status') {
                 reorderTask(activeId, newStatusOrAssignee as string, overIndex);
              } else {
                 // For assignee view, we update assignee task property
                 updateTask(activeId, { assignee: newStatusOrAssignee as string });
                 // And ideally reorder too if we had generic reorder support.
                 // Currently reorderTask only updates 'status' and array order.
                 // So reordering might look weird in Assignee view if we fallback to basic array order without filtering?
                 // Let's focus on STATUS view as primary.
              }
          }
       }
    }

    // 2. Moving Over an Empty Column (Container)
    if (overColumn) {
       // Check if current task is already in this column?
       const targetGroupVal = getStatusFromColumnId(overColumn.id);
       const currentGroupVal = groupBy === 'status' ? activeTask.status : activeTask.assignee;

       if (currentGroupVal !== targetGroupVal) {
          if (groupBy === 'status') {
             // Move to end of column
             // Count tasks in that column
             const tasksInCol = tasks.filter(t => t.status === targetGroupVal).length;
             reorderTask(activeId, targetGroupVal as string, tasksInCol);
          } else {
             // Assignee View - targetGroupVal is the assignee name/id
             const newAssignee = targetGroupVal === 'unassigned' ? undefined : columns.find(c => c.id === overColumn.id)?.title;
             updateTask(activeId, { assignee: newAssignee });
          }
       }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveColumn(null);
    setActiveId(null);

    if (!over) return;

    // Handling Column Reordering
    if (active.data.current?.type === 'Column') {
      if (active.id !== over.id) {
        const oldIndex = columns.findIndex(c => c.id === active.id);
        const newIndex = columns.findIndex(c => c.id === over.id);
        if (activeViewId && oldIndex !== -1 && newIndex !== -1) {
          moveColumnInView(activeViewId, oldIndex, newIndex);
        }
      }
      return;
    }

    // Handling Task Dragging (Final Sort)
    // Cross-column moves usually handled in DragOver now.
    // We just handle reordering within current list here to persist final index accurately.
    const activeTaskId = active.id as string;
    const overId = over.id as string;

    if (activeTaskId !== overId) {
        const activeTask = tasks.find(t => t.id === activeTaskId);
        const overTask = tasks.find(t => t.id === overId); // Might be same item if moved in DragOver?

        if (activeTask && overTask) {
           // Both are tasks
           const activeGroup = groupBy === 'status' ? activeTask.status : activeTask.assignee;
           const overGroup = groupBy === 'status' ? overTask.status : overTask.assignee;

           // Same group sorting
           if (activeGroup === overGroup) {
              const tasksInGroup = tasks.filter(t => {
                 if (groupBy === 'status') return t.status === activeGroup;
                 return t.assignee === activeGroup;
              });
              const oldIndex = tasksInGroup.findIndex(t => t.id === activeTaskId);
              const newIndex = tasksInGroup.findIndex(t => t.id === overId);

              if (oldIndex !== newIndex) {
                 if (groupBy === 'status') {
                    // Need to translate local index to global index or just use reorderTask logic which does local-aware splicing?
                    // our store reorderTask takes 'newIndex' relative to that Status group ideally?
                    // Wait, my implementation of `reorderTask` was:
                    // `targetTasks.splice(newIndex, 0, movedTask);`
                    // where `targetTasks` was `newTasks.filter(t => t.status === newStatus);`
                    // So yes, it expects LOCAL index relative to the status group. Perfect.
                    reorderTask(activeTaskId, activeGroup as string, newIndex);
                 }
              }
           }
        }
    }
  };

  return {
    activeId,
    setActiveId,
    activeColumn,
    setActiveColumn,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragOver, // Exported
  };
}

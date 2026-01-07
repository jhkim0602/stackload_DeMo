"use client";

import { Tag as TagIcon, Users, Calendar as CalendarIcon, List, SlidersHorizontal, GripVertical, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface DraggablePropertySettingsProps {
  properties: string[];
  visibility: Record<string, boolean>;
  onReorder?: (newOrder: string[]) => void;
  onToggle: (prop: string) => void;
}

export function DraggablePropertySettings({
  properties,
  visibility,
  onReorder,
  onToggle
}: DraggablePropertySettingsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        const oldIndex = properties.indexOf(active.id as string);
        const newIndex = properties.indexOf(over.id as string);
        if (onReorder) {
            onReorder(arrayMove(properties, oldIndex, newIndex));
        }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={properties}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1">
           {properties.map(prop => (
              <SortablePropertyItem
                 key={prop}
                 id={prop}
                 visible={prop === 'title' ? true : !!visibility[prop]}
                 onToggle={() => onToggle(prop)}
                 isLocked={prop === 'title'}
              />
           ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortablePropertyItem({ id, visible, onToggle, isLocked }: { id: string, visible: boolean, onToggle: () => void, isLocked?: boolean }) {
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
   } = useSortable({ id });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : 1,
      opacity: isDragging ? 0.5 : 1
   };

   // Map IDs to Labels
   const labels: Record<string, string> = {
      'title': '제목',
      'tags': '태그',
      'assignee': '담당자',
      'priority': '우선순위',
      'dueDate': '마감일',
   };

   const icon = (id === 'tags') ? <TagIcon className="h-3.5 w-3.5" /> :
                (id === 'assignee') ? <Users className="h-3.5 w-3.5" /> :
                (id === 'dueDate') ? <CalendarIcon className="h-3.5 w-3.5" /> :
                (id === 'title') ? <List className="h-3.5 w-3.5" /> :
                (id === 'priority') ? <AlertCircle className="h-3.5 w-3.5" /> :
                <SlidersHorizontal className="h-3.5 w-3.5" />;

   return (
      <div
         ref={setNodeRef}
         style={style}
         className={cn(
             "flex items-center justify-between px-2 py-1.5 rounded-md group bg-popover touch-none",
             isDragging && "bg-accent shadow-md"
         )}
      >
         <div className="flex items-center gap-2">
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-muted rounded text-muted-foreground/50 hover:text-foreground">
               <GripVertical className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-2 text-sm">
               <span className="text-muted-foreground">{icon}</span>
               <span>{labels[id] || id}</span>
            </div>
         </div>
         <Switch
            checked={visible}
            onCheckedChange={isLocked ? undefined : onToggle}
            disabled={isLocked}
            className={`h-4 w-7 ${isLocked ? "opacity-50 cursor-not-allowed !bg-muted" : ""}`}
         />
      </div>
   );
}

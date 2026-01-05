"use client";

import { Tag as TagIcon, Users, Calendar as CalendarIcon, List, SlidersHorizontal } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function DraggablePropertySettings({
  properties,
  visibility,
  onToggle
}: {
  properties: string[],
  visibility: Record<string, boolean>,
  onReorder?: (newOrder: string[]) => void, // Kept for compatibility but unused
  onToggle: (prop: string) => void
}) {
   const items = properties; // No reordering

   return (
      <div className="space-y-1">
         {items.map(prop => (
            <PropertyItem
               key={prop}
               id={prop}
               visible={prop === 'title' ? true : !!visibility[prop]} // Title always true
               onToggle={() => onToggle(prop)}
               isLocked={prop === 'title'}
            />
         ))}
      </div>
   );
}

function PropertyItem({ id, visible, onToggle, isLocked }: { id: string, visible: boolean, onToggle: () => void, isLocked?: boolean }) {

   // Map IDs to Labels
   const labels: Record<string, string> = {
      'title': '제목',
      'tags': '태그',
      'assignee': '담당자',
      'badges': '우선순위', // Changed from '사용자 정의 필드' to '우선순위'
      'dueDate': '마감일',
   };

   const icon = (id === 'tags') ? <TagIcon className="h-3.5 w-3.5" /> :
                (id === 'assignee') ? <Users className="h-3.5 w-3.5" /> :
                (id === 'dueDate') ? <CalendarIcon className="h-3.5 w-3.5" /> :
                (id === 'title') ? <List className="h-3.5 w-3.5" /> :
                <SlidersHorizontal className="h-3.5 w-3.5" />;

   return (
      <div className="flex items-center justify-between px-2 py-1.5 hover:bg-muted/50 rounded-md group bg-popover">
         <div className="flex items-center gap-2">
            {/* Grip Handle Removed */}
            <div className="flex items-center gap-2 text-sm ml-1">
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

"use client";

import { useState } from "react";
import { useWorkspaceStore, Tag } from "../../store/mock-data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Tag as TagIcon, X, Check, MoreHorizontal, ChevronRight, ChevronLeft, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SmartTagPickerProps {
  selectedTagIds?: string[];
  onToggleTag?: (tagId: string) => void;
  trigger?: React.ReactNode;
}

const TAG_COLORS = [
  "bg-neutral-100",     // 기본
  "bg-gray-200",        // 회색
  "bg-amber-200/60",    // 갈색
  "bg-orange-200/60",   // 주황색
  "bg-yellow-200/60",   // 노란색
  "bg-green-200/60",    // 초록색
  "bg-blue-200/60",     // 파란색
  "bg-purple-200/60",   // 보라색
  "bg-pink-200/60",     // 분홍색
  "bg-red-200/60",      // 빨간색
];

function getTextColor(bgColor: string) {
  if (bgColor.includes("neutral")) return "text-neutral-700";
  if (bgColor.includes("gray")) return "text-gray-700";
  if (bgColor.includes("amber")) return "text-amber-900";
  if (bgColor.includes("orange")) return "text-orange-900";
  if (bgColor.includes("yellow")) return "text-yellow-900";
  if (bgColor.includes("green")) return "text-green-900";
  if (bgColor.includes("blue")) return "text-blue-900";
  if (bgColor.includes("purple")) return "text-purple-900";
  if (bgColor.includes("pink")) return "text-pink-900";
  if (bgColor.includes("red")) return "text-red-900";
  return "text-foreground";
}

type ViewState = 'list' | 'create' | 'edit';

export function SmartTagPicker({ selectedTagIds = [], onToggleTag, trigger }: SmartTagPickerProps) {
  const { tags, createTag, updateTag, deleteTag, reorderTags } = useWorkspaceStore();
  const [view, setView] = useState<ViewState>('list');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  // Create / Edit State
  const [tagNameInput, setTagNameInput] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const resetState = () => {
    setView('list');
    setEditingTagId(null);
    setTagNameInput("");
    setSelectedColor(TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]);
  };

  const handlDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
       const oldIndex = tags.findIndex((t) => t.id === active.id);
       const newIndex = tags.findIndex((t) => t.id === over?.id);
       reorderTags(oldIndex, newIndex);
    }
  };

  const handleCreate = () => {
    if (!tagNameInput.trim()) return;
    createTag(tagNameInput.trim(), selectedColor);
    resetState();
  };

  const handleUpdate = () => {
     if (!editingTagId || !tagNameInput.trim()) return;
     updateTag(editingTagId, { name: tagNameInput.trim(), color: selectedColor });
     resetState();
  };

  const handleDelete = () => {
     if (!editingTagId) return;
     if (confirm("Are you sure you want to delete this tag?")) {
        deleteTag(editingTagId);
        resetState();
     }
  };

  const startEdit = (tag: Tag) => {
     setEditingTagId(tag.id);
     setTagNameInput(tag.name);
     setSelectedColor(tag.color);
     setView('edit');
  };

  const renderColorPicker = () => (
     <div className="flex flex-wrap gap-1.5 p-1">
        {TAG_COLORS.map(color => (
           <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={cn(
                 "w-5 h-5 rounded-full ring-1 ring-inset ring-black/10 hover:scale-110 transition-transform",
                 color,
                 selectedColor === color && "ring-2 ring-primary ring-offset-1 scale-110"
              )}
           />
        ))}
     </div>
  );

  return (
    <Popover onOpenChange={(open) => !open && resetState()}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-foreground">
             <TagIcon className="h-3.5 w-3.5" />
             Tags
             {selectedTagIds.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{selectedTagIds.length}</Badge>
             )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 overflow-hidden" align="start">

         {/* --- LIST VIEW --- */}
         {view === 'list' && (
            <div className="flex flex-col h-full">
               <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20">
                  <span className="text-xs font-semibold text-muted-foreground">태그</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => {
                     setTagNameInput("");
                     setSelectedColor(TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]);
                     setView('create');
                  }}>
                     <Plus className="h-3.5 w-3.5" />
                  </Button>
               </div>

               <div className="max-h-[280px] overflow-y-auto py-1">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlDragEnd}>
                     <SortableContext items={tags.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        {tags.map(tag => (
                           <SortableTagItem
                              key={tag.id}
                              tag={tag}
                              isSelected={selectedTagIds.includes(tag.id)}
                              onToggle={() => onToggleTag?.(tag.id)}
                              onEdit={() => startEdit(tag)}
                           />
                        ))}
                     </SortableContext>
                  </DndContext>

                  {tags.length === 0 && (
                     <div className="text-xs text-center py-4 text-muted-foreground">태그가 없습니다.</div>
                  )}
               </div>
            </div>
         )}

         {/* --- CREATE VIEW --- */}
         {view === 'create' && (
            <div className="flex flex-col gap-3 p-3">
               <div className="flex items-center gap-2 mb-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6 -ml-1" onClick={() => setView('list')}>
                     <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">새 태그 생성</span>
               </div>

               <div className="space-y-3">
                  <div className="flex items-center gap-2 px-2 py-1 border rounded-md">
                     <Badge className={cn("rounded-sm px-2 font-normal", selectedColor, getTextColor(selectedColor))}>
                        {tagNameInput || "태그명"}
                     </Badge>
                     <Input
                        value={tagNameInput}
                        onChange={e => setTagNameInput(e.target.value)}
                        placeholder="태그 이름"
                        className="border-none shadow-none h-7 p-0 focus-visible:ring-0 text-sm"
                        autoFocus
                        onKeyDown={e => e.key === 'Enter' && handleCreate()}
                     />
                  </div>

                  <div>
                     <span className="text-xs text-muted-foreground block mb-2 px-1">색상 선택</span>
                     {renderColorPicker()}
                  </div>

                  <Button size="sm" className="w-full" onClick={handleCreate}>생성</Button>
               </div>
            </div>
         )}

         {/* --- EDIT VIEW --- */}
         {view === 'edit' && (
            <div className="flex flex-col gap-3 p-3">
               <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                     <Button variant="ghost" size="icon" className="h-6 w-6 -ml-1" onClick={() => setView('list')}>
                        <ChevronLeft className="h-4 w-4" />
                     </Button>
                     <span className="text-sm font-medium">태그 편집</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete}>
                     <Trash2 className="h-3.5 w-3.5" />
                  </Button>
               </div>

               <div className="space-y-3">
                  <div className="flex items-center gap-2 px-2 py-1 border rounded-md">
                     <Badge className={cn("rounded-sm px-2 font-normal max-w-[120px] truncate", selectedColor, getTextColor(selectedColor))}>
                        {tagNameInput || "태그명"}
                     </Badge>
                     <Input
                        value={tagNameInput}
                        onChange={e => setTagNameInput(e.target.value)}
                        className="border-none shadow-none h-7 p-0 focus-visible:ring-0 text-sm"
                        onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                     />
                  </div>

                  <div>
                     <span className="text-xs text-muted-foreground block mb-2 px-1">색상 선택</span>
                     {renderColorPicker()}
                  </div>

                  <Button size="sm" className="w-full" onClick={handleUpdate}>저장</Button>
               </div>
            </div>
         )}

      </PopoverContent>
    </Popover>
  );
}

function SortableTagItem({ tag, isSelected, onToggle, onEdit }: { tag: Tag, isSelected: boolean, onToggle: () => void, onEdit: () => void }) {
   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tag.id });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : 'auto',
      opacity: isDragging ? 0.5 : 1,
   };

   const textClass = getTextColor(tag.color);

   return (
      <div
         ref={setNodeRef}
         style={style}
         className="flex items-center justify-between px-2 py-1 hover:bg-muted/50 group/item relative"
      >
         <div className="flex items-center gap-2 flex-1 min-w-0">
            <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground">
               <GripVertical className="h-3.5 w-3.5" />
            </div>

            <div onClick={onToggle} className="flex-1 cursor-pointer flex items-center min-w-0">
               <Badge
                  variant="secondary"
                  className={cn("px-1.5 py-0 h-5 text-xs font-normal border-0 pointer-events-none rounded-sm max-w-full truncate", tag.color, textClass)}
               >
                  {tag.name}
               </Badge>
            </div>
         </div>

         <div className="flex items-center gap-1">
            {isSelected && <Check className="h-3.5 w-3.5 text-primary mr-1" />}
            <Button
               variant="ghost"
               size="icon"
               className="h-6 w-6 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity"
               onClick={(e) => { e.stopPropagation(); onEdit(); }}
            >
               <ChevronRight className="h-3.5 w-3.5" />
            </Button>
         </div>
      </div>
   );
}

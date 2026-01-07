import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KanbanSquare, List, Calendar, User, Tag, Flag, Clock, Layout, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "../../store/mock-data";

interface ViewCreationWizardProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (viewId: string) => void;
}

export function ViewCreationWizard({ projectId, isOpen, onClose, onCreated }: ViewCreationWizardProps) {
  const { addView, tags } = useWorkspaceStore();
  const [viewName, setViewName] = useState("");
  const [viewType, setViewType] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [grouping, setGrouping] = useState<'status' | 'assignee' | 'priority' | 'dueDate' | 'tag'>('status');
  // Default to the first tag color if available, else fallback to 'blue'
  const availableColors = Array.from(new Set(tags.map(t => t.color)));
  const [selectedColor, setSelectedColor] = useState(availableColors[0] || 'blue');
  const [selectedIcon, setSelectedIcon] = useState('📋');

  const handleCreate = () => {
    if (!viewName.trim()) return;

    const viewId = `v-${Date.now()}`;
    addView(projectId, {
        id: viewId,
        projectId,
        name: viewName,
        type: viewType,
        groupBy: grouping as any,
        color: selectedColor,
        icon: selectedIcon,
        columns: []
    });

    onCreated(viewId);
    onClose();
    setViewName("");
    setGrouping('status');
  };

  const getHelperText = () => {
      switch(grouping) {
        case 'status': return "전통적인 칸반입니다. '할 일', '진행 중', '완료' 등의 상태 흐름을 추적합니다.";
        case 'tag': return "프로젝트, 파트(FE/BE), 유형(Bug/Feature) 등 태그별로 업무를 모아봅니다.";
        case 'priority': return "긴급, 높음, 보통 등 중요도 순으로 업무를 집중 관리합니다.";
        default: return "";
      }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-background">
        <DialogHeader className="px-6 py-4 border-b bg-muted/20">
            <DialogTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                새로운 뷰 만들기
            </DialogTitle>
        </DialogHeader>

        <div className="flex">
            {/* Left Col: Inputs */}
            <div className="flex-1 p-6 space-y-6 border-r">
                <div className="space-y-3">
                    <Label>뷰 이름</Label>
                    <Input
                        placeholder="예: 프론트엔드 태스크"
                        value={viewName}
                        onChange={(e) => setViewName(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="space-y-3">
                    <Label>그룹 기준</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <GroupingOption id="status" label="진행 상태" icon={<CheckCircle2 className="h-4 w-4" />} selected={grouping === 'status'} onClick={() => setGrouping('status')} />
                        <GroupingOption id="tag" label="태그" icon={<Tag className="h-4 w-4" />} selected={grouping === 'tag'} onClick={() => setGrouping('tag')} />
                        <GroupingOption id="priority" label="중요도" icon={<Flag className="h-4 w-4" />} selected={grouping === 'priority'} onClick={() => setGrouping('priority')} />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>스타일 (탭)</Label>
                    <div className="flex items-center gap-4">
                         <div className="flex gap-1">
                            {availableColors.length > 0 ? availableColors.map(c => (
                                <div
                                    key={c}
                                    onClick={() => setSelectedColor(c)}
                                    className={cn(
                                        "w-6 h-6 rounded-full cursor-pointer ring-1 ring-offset-1 transition-all hover:scale-110",
                                        `bg-${c}-500`,
                                        selectedColor === c ? "ring-primary" : "ring-transparent"
                                    )}
                                />
                            )) : (
                                <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                                    사용 가능한 태그 색상이 없습니다.
                                </div>
                            )}
                        </div>
                        <div className="w-[1px] h-6 bg-muted"></div>
                        <div className="flex gap-1">
                            {['📋', '📅', '🚀', '💻', '🎨', '🔥'].map(icon => (
                                <div
                                    key={icon}
                                    onClick={() => setSelectedIcon(icon)}
                                    className={cn("w-7 h-7 flex items-center justify-center rounded cursor-pointer hover:bg-muted font-emoji", selectedIcon === icon ? "bg-primary/10 ring-1 ring-primary" : "")}
                                >
                                    {icon}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Col: Preview/Help */}
            <div className="w-[240px] bg-muted/10 p-6 flex flex-col">
                <div className="mb-6">
                    <Label className="text-muted-foreground mb-2 block">미리보기</Label>
                    <div className="flex gap-1 items-end opacity-80">
                         {/* Mock Sidebar Tab */}
                         <div className={cn("px-3 py-2 rounded-t-lg text-white text-xs font-medium flex items-center gap-2 shadow-sm", `bg-${selectedColor}-500`)}>
                             <span>{selectedIcon}</span>
                             {viewName || "새로운 뷰"}
                         </div>
                    </div>
                </div>

                <div className="flex-1">
                    <Label className="text-muted-foreground mb-2 block">가이드</Label>
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                        "{grouping === 'status' ? '진행 상태' :
                          grouping === 'assignee' ? '담당자' :
                          grouping === 'tag' ? '태그' :
                          '중요도'}" 기준
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 leading-normal">
                        {getHelperText()}
                    </p>

                    <div className="mt-8 p-3 bg-background rounded-lg border text-xs text-muted-foreground">
                        <span className="font-semibold block mb-1">💡 Tip</span>
                        생성 후에도 색상과 이름은<br/>'뷰 관리'에서 변경 가능합니다.
                    </div>
                </div>
            </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/20 border-t flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>취소</Button>
            <Button onClick={handleCreate} disabled={!viewName.trim()}>뷰 생성하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GroupingOption({ id, label, icon, selected, onClick }: any) {
    return (
        <Button
            variant="outline"
            className={cn(
                "justify-start h-9 px-2 text-sm transition-all",
                selected && "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
            )}
            onClick={onClick}
        >
            <span className={cn("mr-2", selected ? "text-primary" : "text-muted-foreground")}>{icon}</span>
            {label}
        </Button>
    )
}

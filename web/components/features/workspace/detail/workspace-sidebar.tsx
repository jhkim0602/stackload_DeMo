"use client";

import { useWorkspaceStore } from "../store/mock-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Kanban, Calendar, FileText, Lightbulb, Settings, ChevronLeft, Hash, Plus, Volume2, Bell, Briefcase } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface WorkspaceSidebarProps {
  projectId: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function WorkspaceSidebar({ projectId, activeTab, onTabChange }: WorkspaceSidebarProps) {
  const { projects } = useWorkspaceStore();
  const project = projects.find(p => p.id === projectId);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'board', label: 'Board', icon: Kanban },
    { id: 'docs', label: 'Documents', icon: FileText },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb },
  ];

  return (
    <div className="w-64 border-r bg-muted/10 h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-4 border-b">
        <Link href="/workspace" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Hub
        </Link>
        <div className="flex items-center gap-2">
           <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
             {project?.title.charAt(0)}
           </div>
           <div className="font-semibold text-sm truncate">
             {project?.title || 'Loading...'}
           </div>
        </div>
      </div>

      {/* Personal Zone (Moved Up) */}
      <div className="py-2 px-2 space-y-0.5 border-b mb-2 pb-2">
          <Button
             variant={activeTab === 'inbox' ? "secondary" : "ghost"}
             className={cn("w-full justify-start h-8 px-2 text-muted-foreground font-normal", activeTab === 'inbox' && "bg-secondary text-foreground")}
             onClick={() => onTabChange('inbox')}
          >
             <Bell className="mr-2 h-4 w-4" />
             Inbox
             <span className="ml-auto text-[10px] bg-red-500 text-white rounded-full px-1.5">2</span>
          </Button>
          <Button
             variant={activeTab === 'briefcase' ? "secondary" : "ghost"}
             className={cn("w-full justify-start h-8 px-2 text-muted-foreground font-normal", activeTab === 'briefcase' && "bg-secondary text-foreground")}
             onClick={() => onTabChange('briefcase')}
          >
             <Briefcase className="mr-2 h-4 w-4" />
             Briefcase
          </Button>
      </div>

      <div className="py-2 px-2 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              activeTab === item.id && "bg-secondary"
            )}
            onClick={() => onTabChange(item.id)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}

      </div>

      <div className="flex-1 pt-0 px-2 space-y-4 overflow-y-auto">


        {/* Channels */}
        <div>
           <div className="px-2 mb-1 text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between group">
              Text Channels
              <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 cursor-pointer" />
           </div>
           <div className="space-y-0.5">
              {['general', 'dev', 'random'].map(channel => (
                 <Button
                   key={channel}
                   variant="ghost"
                   className={cn("w-full justify-start h-8 px-2 text-muted-foreground font-normal", activeTab === `chat-${channel}` && "bg-muted text-foreground font-medium")}
                   onClick={() => onTabChange(`chat-${channel}`)}
                 >
                    <Hash className="mr-2 h-3.5 w-3.5" />
                    {channel}
                 </Button>
              ))}
           </div>
        </div>

        {/* Voice Rooms */}
        <div>
           <div className="px-2 mb-1 text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between group">
              Voice Channels
              <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 cursor-pointer" />
           </div>
           <div className="space-y-0.5">
              <Button
                 variant="ghost"
                 className={cn("w-full justify-start h-8 px-2 text-muted-foreground font-normal", activeTab === 'huddle' && "bg-muted text-foreground font-medium")}
                 onClick={() => onTabChange('huddle')}
              >
                 <Volume2 className="mr-2 h-3.5 w-3.5" />
                 Dev Room
              </Button>
              <Button variant="ghost" className="w-full justify-start h-8 px-2 text-muted-foreground font-normal">
                 <Volume2 className="mr-2 h-3.5 w-3.5" />
                 Lounge
              </Button>
           </div>
        </div>
      </div>

      <div className="p-4 border-t">
        <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">Team</div>
        <div className="space-y-1">
          {project?.members.map((member, i) => (
            <div key={i} className="flex items-center justify-between px-2 py-1.5 text-sm group hover:bg-muted/50 rounded-md">
               <div className="flex items-center overflow-hidden">
                 <div className={`h-2 w-2 rounded-full mr-2 ${member.online ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                 <span className="truncate">{member.name}</span>
               </div>
               <span className="text-[10px] text-muted-foreground border px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{member.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

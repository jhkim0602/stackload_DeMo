"use client";

import { useWorkspaceStore } from "../store/mock-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Kanban, Calendar, FileText, Lightbulb, Settings, ChevronLeft, Hash, Plus, Volume2, Bell, Briefcase, User, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
    <div className="w-64 h-[calc(100vh-4rem)] flex flex-col border-r border-white/10 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xl supports-[backdrop-filter]:bg-opacity-60 relative z-20 transition-all duration-300">

      {/* Project Header */}
      <div className="p-4">
        <Link href="/workspace" className="flex items-center text-xs font-medium text-muted-foreground hover:text-primary mb-4 transition-colors group">
          <ChevronLeft className="h-3 w-3 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          Back to Hub
        </Link>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-default">
           <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
             {project?.title.charAt(0)}
           </div>
           <div className="flex-1 min-w-0">
             <div className="font-bold text-sm truncate text-foreground">
               {project?.title || 'Loading...'}
             </div>
             <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
               {project?.type || 'Project'}
             </div>
           </div>
        </div>
      </div>

      <Separator className="bg-border/50 mx-4 opacity-50" />

      {/* Personal Tools */}
      <div className="p-3 space-y-1">
          <SidebarItem
            active={activeTab === 'inbox'}
            onClick={() => onTabChange('inbox')}
            icon={Bell}
            label="Inbox"
            badge="2"
          />
          <SidebarItem
            active={activeTab === 'briefcase'}
            onClick={() => onTabChange('briefcase')}
            icon={Briefcase}
            label="My Briefcase"
          />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-none">

        {/* Main Navigation */}
        <div className="space-y-1">
          <div className="px-3 text-xs font-semibold text-muted-foreground/70 mb-2 uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => (
            <SidebarItem
              key={item.id}
              active={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </div>

        {/* Channels Group */}
        <div className="space-y-1">
           <div className="px-3 flex items-center justify-between group cursor-pointer mb-2">
              <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Connect</span>
              <Plus className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
           </div>

           <div className="space-y-0.5">
              {/* Voice Channel */}
              <SidebarItem
                 active={activeTab === 'huddle'}
                 onClick={() => onTabChange('huddle')}
                 icon={Volume2}
                 label="Huddle"
                 className={cn(
                    "data-[active=true]:bg-indigo-500/10 data-[active=true]:text-indigo-600 dark:data-[active=true]:text-indigo-400",
                    activeTab !== 'huddle' && "text-muted-foreground"
                 )}
                 iconClassName={activeTab === 'huddle' ? "text-indigo-500" : ""}
              />

              {/* Text Channels */}
              {['general', 'dev', 'announcements'].map(channel => (
                 <button
                   key={channel}
                   onClick={() => onTabChange(`chat-${channel}`)}
                   className={cn(
                     "w-full flex items-center px-3 py-1.5 rounded-lg text-sm transition-all duration-200 group relative",
                     activeTab === `chat-${channel}`
                       ? "text-foreground bg-white dark:bg-white/10 font-medium shadow-sm"
                       : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground"
                   )}
                 >
                    <span className="w-4 h-4 mr-3 flex items-center justify-center text-muted-foreground/50 group-hover:text-muted-foreground">#</span>
                    <span className="truncate">{channel}</span>
                 </button>
              ))}
           </div>
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-border/50 bg-white/30 dark:bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
          <Avatar className="h-9 w-9 border-2 border-white dark:border-zinc-800 shadow-sm">
             <AvatarImage src="/placeholder-avatar.jpg" />
             <AvatarFallback className="bg-gradient-to-tr from-pink-500 to-orange-400 text-white font-bold">ME</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
             <div className="text-sm font-semibold truncate">My Profile</div>
             <div className="text-xs text-muted-foreground flex items-center gap-1.5">
               <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
               Online
             </div>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}

// Reusable Custom Sidebar Item
interface SidebarItemProps {
  active?: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  badge?: string;
  className?: string;
  iconClassName?: string;
}

function SidebarItem({ active, onClick, icon: Icon, label, badge, className, iconClassName }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      data-active={active}
      className={cn(
        "w-full flex items-center px-3 py-2 rounded-xl text-sm transition-all duration-200 group relative overflow-hidden",
        active
          ? "bg-white dark:bg-white/10 text-primary font-semibold shadow-sm ring-1 ring-black/5 dark:ring-white/5"
          : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground",
        className
      )}
    >
      {active && (
         <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-1 rounded-r-full bg-primary" />
      )}
      <Icon className={cn("mr-3 h-4 w-4 transition-colors", active ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground", iconClassName)} />
      <span className="flex-1 text-left truncate">{label}</span>
      {badge && (
        <span className={cn(
           "px-1.5 py-0.5 rounded-md text-[10px] font-bold min-w-[20px]",
           active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20"
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}

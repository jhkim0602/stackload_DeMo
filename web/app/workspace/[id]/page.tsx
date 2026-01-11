"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { WorkspaceSidebar } from "@/components/features/workspace/detail/workspace-sidebar";
import { DashboardOverview } from "@/components/features/workspace/detail/overview";
import { KanbanBoard } from "@/components/features/workspace/detail/board";
import { ScheduleView } from "@/components/features/workspace/detail/schedule";
import { DocsView } from "@/components/features/workspace/detail/docs";
import { IdeaBoard } from "@/components/features/workspace/detail/idea-board";
import { TeamChat } from "@/components/features/workspace/detail/chat/team-chat";
import { GlobalHuddleSidebar } from "@/components/features/workspace/detail/huddle/live-huddle";
import { UnifiedInbox } from "@/components/features/workspace/personal/unified-inbox";
import { MyBriefcase } from "@/components/features/workspace/personal/my-briefcase";
import { TaskDetailModal } from "@/components/features/workspace/modules/task/detail-modal";
import { useWorkspaceStore } from "@/components/features/workspace/store/mock-data";
import { useSocketStore } from "@/components/features/workspace/store/socket-store";
import { useEffect } from "react";

export default function WorkspaceDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { activeTaskId, setActiveTaskId } = useWorkspaceStore();
  const { connectSocket, disconnectSocket } = useSocketStore();
  const [activeTab, setActiveTab] = useState('overview');

  const [isHuddleOpen, setIsHuddleOpen] = useState(false);
  const [huddleViewMode, setHuddleViewMode] = useState<'full' | 'pip'>('full');

  useEffect(() => {
    // Connect to Workspace Server (Port 4000)
    if (projectId) {
        connectSocket(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", "u1", projectId);
    }
    return () => {
        disconnectSocket();
    }
  }, [projectId, connectSocket, disconnectSocket]);

  const handleTabChange = (tab: string) => {
      if (tab === 'huddle') {
          // Smart Toggle Logic
          if (!isHuddleOpen) {
              setIsHuddleOpen(true);
              setHuddleViewMode('full');
          } else {
              // If already open
               if (huddleViewMode === 'pip') {
                   // Restore to Full Screen
                   setHuddleViewMode('full');
               } else {
                   // Toggle Off
                   setIsHuddleOpen(!isHuddleOpen);
               }
          }
      } else {
          setActiveTab(tab);
          // Auto-minimize Huddle when navigating
          if (isHuddleOpen && huddleViewMode === 'full') {
              setHuddleViewMode('pip');
          }
      }
  };

  const renderContent = () => {
    if (activeTab.startsWith('chat-')) {
       const channel = activeTab.replace('chat-', '');
       return <TeamChat projectId={projectId} channelName={channel} />;
    }

    switch (activeTab) {
      case 'board':
        return <div className="h-full p-6"><KanbanBoard projectId={projectId} onNavigateToDoc={() => setActiveTab('docs')} /></div>;
      case 'schedule':
        return <ScheduleView projectId={projectId} />;
      case 'docs':
        return <DocsView projectId={projectId} />;
      case 'ideas':
        return <div className="h-full"><IdeaBoard projectId={projectId} /></div>;
      case 'inbox':
        return <div className="h-full"><UnifiedInbox /></div>;
      case 'briefcase':
        return <div className="h-full"><MyBriefcase /></div>;
      default:
        // Pass projectId to new dashboard component
        return <div className="h-full overflow-y-auto"><DashboardOverview projectId={projectId} /></div>;
    }
  };

  return (
    <SidebarLayout>
      <div className="flex h-full w-full relative">
        <WorkspaceSidebar
          projectId={projectId}
          activeTab={activeTab} // Note: This won't highlight 'huddle' button when sidebar is open, which acts as a toggle.
          onTabChange={handleTabChange}
        />

        {/* Global Huddle Sidebar (Left or Right? Plan said 'Left or Right', reusing layout logic).
            Let's put it between Sidebar and Main for "PIP/Sidebar" feel.
        */}
        <main className={`flex-1 bg-background h-[calc(100vh-4rem)] overflow-auto transition-all duration-300`}>
          {renderContent()}
        </main>
      </div>

      {/* Global Huddle Overlay (Independent of Layout Flow) */}
      <GlobalHuddleSidebar
          projectId={projectId}
          isOpen={isHuddleOpen}
          onClose={() => setIsHuddleOpen(false)}
          viewMode={huddleViewMode}
          onViewModeChange={setHuddleViewMode}
      />

      <TaskDetailModal
        taskId={activeTaskId}
        onClose={() => setActiveTaskId(null)}
      />
    </SidebarLayout>
  );
}

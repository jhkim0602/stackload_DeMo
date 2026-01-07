"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { WorkspaceSidebar } from "@/components/features/workspace/detail/workspace-sidebar";
import { DashboardOverview } from "@/components/features/workspace/detail/dashboard-overview";
import { KanbanBoard } from "@/components/features/workspace/detail/kanban-board";
import { ScheduleView } from "@/components/features/workspace/detail/schedule-view";
import { DocsView } from "@/components/features/workspace/detail/docs-view";
import { IdeaBoard } from "@/components/features/workspace/detail/idea-board";
import { TeamChat } from "@/components/features/workspace/detail/chat/team-chat";
import { LiveHuddle } from "@/components/features/workspace/detail/huddle/live-huddle";
import { UnifiedInbox } from "@/components/features/workspace/personal/unified-inbox";
import { MyBriefcase } from "@/components/features/workspace/personal/my-briefcase";
import { TaskDetailModal } from "@/components/features/workspace/modules/task/detail-modal";
import { useWorkspaceStore } from "@/components/features/workspace/store/mock-data";

export default function WorkspaceDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { activeTaskId, setActiveTaskId } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    if (activeTab.startsWith('chat-')) {
       const channel = activeTab.replace('chat-', '');
       return <TeamChat projectId={projectId} channelName={channel} />;
    }

    if (activeTab === 'huddle') {
       return <LiveHuddle projectId={projectId} onClose={() => setActiveTab('overview')} />;
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
      <div className="flex h-full w-full">
        <WorkspaceSidebar
          projectId={projectId}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <main className="flex-1 overflow-auto bg-background h-[calc(100vh-4rem)]">
          {renderContent()}
        </main>
      </div>

      <TaskDetailModal
        taskId={activeTaskId}
        onClose={() => setActiveTaskId(null)}
      />
    </SidebarLayout>
  );
}

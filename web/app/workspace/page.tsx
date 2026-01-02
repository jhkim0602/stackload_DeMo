"use client";

import { SectionLandingPage, LandingItem } from "@/components/layout/section-landing-page";
import { LayoutGrid, Wrench } from "lucide-react";

import { Suspense } from "react";

function WorkspaceContent() {
  const items: LandingItem[] = [
    {
      title: "프로젝트 관리",
      description: "진행 중인 프로젝트의 상태를 한눈에 파악하고 효율적으로 관리하세요.",
      href: "/workspace/projects",
      icon: <LayoutGrid className="w-6 h-6" />,
      isComingSoon: true,
    },
    {
      title: "협업 도구",
      description: "팀 생산성을 높여주는 다양한 협업 툴과 유틸리티를 제공합니다.",
      href: "/workspace/tools",
      icon: <Wrench className="w-6 h-6" />,
      isComingSoon: true,
    },
  ];

  return (
    <SectionLandingPage
      title="워크스페이스"
      description="당신의 프로젝트를 성공으로 이끄는 스마트한 작업 공간입니다."
      items={items}
    />
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <WorkspaceContent />
    </Suspense>
  );
}

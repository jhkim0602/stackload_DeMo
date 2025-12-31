"use client";

import { SectionLandingPage, LandingItem } from "@/components/layout/section-landing-page";
import { BookOpen, Map, Database } from "lucide-react";

export default function InsightsPage() {
  const items: LandingItem[] = [
    {
      title: "기술 블로그",
      description: "국내외 주요 기술 기업들의 엔지니어링 블로그를 한곳에서 확인하세요. 최신 트렌드를 놓치지 마세요.",
      href: "/insights/tech-blog",
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      title: "개발자 로드맵",
      description: "주니어부터 시니어까지, 커리어 성장을 위해 무엇을 공부해야 할지 단계별로 안내합니다.",
      href: "/insights/roadmap",
      icon: <Map className="w-6 h-6" />,
      isComingSoon: true, // Assuming this is not fully ready yet based on previous conversations
    },
    {
      title: "테크 허브",
      description: "다양한 라이브러리와 프레임워크 정보를 탐색하고 내 프로젝트에 적합한 기술을 찾아보세요.",
      href: "/insights/tech-hub",
      icon: <Database className="w-6 h-6" />,
      isComingSoon: true,
    },
  ];

  return (
    <SectionLandingPage
      title="인사이트"
      description="개발자의 성장을 위한 지식과 정보를 탐험하세요."
      items={items}
    />
  );
}

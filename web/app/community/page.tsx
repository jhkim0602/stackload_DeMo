"use client";

import { SectionLandingPage, LandingItem } from "@/components/layout/section-landing-page";
import { MessageSquare, Users, UserPlus } from "lucide-react";

export default function CommunityPage() {
  const items: LandingItem[] = [
    {
      title: "자유 게시판",
      description: "개발 이야기, 고민 상담, 정보 공유 등 자유롭게 소통하는 공간입니다.",
      href: "/community/free-board",
      icon: <MessageSquare className="w-6 h-6" />,
      isComingSoon: true,
    },
    {
      title: "스터디 & 모임",
      description: "함께 성장할 스터디 멤버를 모집하거나 오프라인 모임에 참여해보세요.",
      href: "/community/study",
      icon: <Users className="w-6 h-6" />,
      isComingSoon: true,
    },
    {
      title: "팀원 모집",
      description: "사이드 프로젝트를 함께할 열정적인 팀원을 찾고 계신가요?",
      href: "/community/team",
      icon: <UserPlus className="w-6 h-6" />,
      isComingSoon: true,
    },
  ];

  return (
    <SectionLandingPage
      title="커뮤니티"
      description="함께 성장하는 즐거움, 동료 개발자들과 소통하세요."
      items={items}
    />
  );
}

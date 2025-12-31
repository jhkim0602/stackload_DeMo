"use client";

import { SectionLandingPage, LandingItem } from "@/components/layout/section-landing-page";
import { Trophy, Briefcase } from "lucide-react";

export default function CareerPage() {
  const items: LandingItem[] = [
    {
      title: "대외활동",
      description: "해커톤, 경진대회, 개발 동아리 등 다양한 대외활동 정보를 모아보세요.",
      href: "/career/activities",
      icon: <Trophy className="w-6 h-6" />,
      isComingSoon: true,
    },
    {
      title: "채용 공고",
      description: "엄선된 개발자 채용 정보와 포지션 제안을 확인하고 지원해보세요.",
      href: "/career/jobs",
      icon: <Briefcase className="w-6 h-6" />,
      isComingSoon: true,
    },
  ];

  return (
    <SectionLandingPage
      title="커리어"
      description="더 넓은 세상으로 나아갈 수 있는 기회를 잡으세요."
      items={items}
    />
  );
}

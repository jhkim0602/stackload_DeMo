"use client";

import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface LandingItem {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
  isComingSoon?: boolean;
}

interface SectionLandingPageProps {
  title: string;
  description: string;
  items: LandingItem[];
  className?: string;
}

export function SectionLandingPage({
  title,
  description,
  items,
  className,
}: SectionLandingPageProps) {
  return (
    <div className={cn("min-h-screen bg-background pt-20 pb-16", className)}>
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-16 text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {items.map((item, index) => (
            <LandingCard key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LandingCard({ item }: { item: LandingItem }) {
  const content = (
    <div className="relative group p-8 h-full rounded-2xl border border-border/50 bg-card hover:bg-accent/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Icon Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="p-3 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            {item.icon}
          </div>
          {item.isComingSoon && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
              Coming Soon
            </span>
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 space-y-2 mb-6">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {item.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
            {item.description}
            </p>
        </div>

        {/* Footer Action */}
        <div className="flex items-center text-sm font-semibold text-primary/80 group-hover:text-primary transition-colors">
          {item.isComingSoon ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              준비 중
            </>
          ) : (
            <>
              바로가기 <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (item.isComingSoon) {
    return <div className="cursor-not-allowed opacity-80 select-none">{content}</div>;
  }

  return (
    <Link href={item.href} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl">
      {content}
    </Link>
  );
}

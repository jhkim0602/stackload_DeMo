"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { AuthModal } from "@/components/auth/auth-modal";
import { isFlutterWebView } from "@/lib/webview-bridge";
import { BlogTypeToggle } from "@/components/domains/tech-blog/blog-type-toggle";
import { BlogSelector } from "@/components/domains/tech-blog/blog-selector";
import { useUrlFilters } from "@/hooks/use-url-filters";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import React from "react";

export function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isTechBlog = pathname.startsWith("/insights/tech-blog");

  // Use URL filters hook for Tech Blog state (synced via URL)
  const {
    blogType,
    selectedBlog,
    handleBlogTypeChange,
    handleBlogChange,
  } = useUrlFilters();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 border-b border-slate-200/50 dark:border-slate-700/50 transition-colors duration-300">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity mr-4">
              <span className="font-black text-xl text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                <span className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-1 rounded mr-1">SL</span>
                StackLoad
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {/* 인사이트 */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger onClick={() => router.push('/insights')}>인사이트</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[1fr_1fr]">
                        <ListItem href="/insights/tech-blog" title="기술 블로그">
                          최신 기술 트렌드와 아티클을 한눈에 확인하세요.
                        </ListItem>
                        <ListItem href="/insights/roadmap" title="개발자 로드맵">
                          커리어 성장을 위한 단계별 가이드.
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* 커리어 */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger onClick={() => router.push('/career')}>커리어</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[1fr_1fr]">
                        <ListItem href="/career/activities" title="대외활동">
                          해커톤, 경진대회, 동아리 정보.
                        </ListItem>
                        <ListItem href="/career/jobs" title="채용 공고">
                          엄선된 개발자 포지션과 기회.
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* 커뮤니티 */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger onClick={() => router.push('/community')}>커뮤니티</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[1fr_1fr]">
                        <ListItem href="/community" title="자유 게시판">
                          개발자들의 자유로운 소통 공간.
                        </ListItem>
                        <ListItem href="/community/study" title="스터디 & 모임">
                          함께 성장하는 동료 찾기.
                        </ListItem>
                        <ListItem href="/community/team" title="팀원 모집">
                          사이드 프로젝트 팀원 구하기.
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* 워크스페이스 */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger onClick={() => router.push('/workspace')}>워크스페이스</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[1fr_1fr]">
                        <ListItem href="/workspace" title="프로젝트 관리">
                          내 프로젝트 진행 상황 한눈에 보기.
                        </ListItem>
                        <ListItem href="/workspace/tools" title="협업 도구">
                          생산성을 높이는 유용한 도구들.
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* AI 면접 */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger onClick={() => router.push('/interview')}>AI 면접</NavigationMenuTrigger>
                    <NavigationMenuContent>
                       <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <a
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-500 to-indigo-600 p-6 no-underline outline-none focus:shadow-md"
                              href="/interview"
                            >
                              <div className="mb-2 mt-4 text-lg font-medium text-white">
                                AI 모의 면접
                              </div>
                              <p className="text-sm leading-tight text-white/90">
                                실전 같은 AI 면접을 경험하고 피드백을 받아보세요.
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                        <ListItem href="/interview/analysis" title="면접 분석">
                          나의 면접 실력과 성향 분석 리포트.
                        </ListItem>
                        <ListItem href="/interview/room" title="면접 대기실">
                          지금 바로 면접 시작하기.
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Tech Blog Specific Filters */}
            {isTechBlog && (
              <div className="flex items-center gap-2 mr-2">
                 <div className="hidden sm:block">
                  <BlogTypeToggle
                    blogType={blogType}
                    onBlogTypeChange={handleBlogTypeChange}
                  />
                 </div>
                 <div className="hidden md:block">
                  <BlogSelector
                    blogType={blogType}
                    selectedBlog={selectedBlog}
                    onBlogChange={handleBlogChange}
                  />
                 </div>
              </div>
            )}

            <ThemeToggle />
            {!isFlutterWebView() && (
              <UserMenu onLoginClick={() => setIsAuthModalOpen(true)} />
            )}
          </div>
        </div>

        {/* Mobile Filter View for Tech Blog */}
        {isTechBlog && (
          <div className="sm:hidden border-t border-slate-200/50 dark:border-slate-700/50 p-2 bg-background/50 backdrop-blur-md">
             <div className="flex items-center gap-2 justify-between">
                <BlogTypeToggle
                    blogType={blogType}
                    onBlogTypeChange={handleBlogTypeChange}
                  />
                 <BlogSelector
                    blogType={blogType}
                    selectedBlog={selectedBlog}
                    onBlogChange={handleBlogChange}
                    className="w-[140px]"
                  />
             </div>
          </div>
        )}
      </header>

      <AuthModal
        open={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
      />
    </>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

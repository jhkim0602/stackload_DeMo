"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { AuthModal } from "@/components/auth/auth-modal";
import { isFlutterWebView } from "@/lib/webview-bridge";
import { BlogTypeToggle } from "@/components/domains/tech-blog/blog-type-toggle";
import { BlogSelector } from "@/components/domains/tech-blog/blog-selector";
import { useUrlFilters } from "@/hooks/use-url-filters";

export function GlobalHeader() {
  const pathname = usePathname();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isTechBlog = pathname.startsWith("/insights/tech-blog");

  // Use URL filters hook for Tech Blog state (synced via URL)
  const {
    blogType,
    selectedBlog,
    handleBlogTypeChange,
    handleBlogChange,
  } = useUrlFilters();

  const navItems = [
    { label: "Insights", href: "/insights" },
    { label: "Interview", href: "/interview" },
    { label: "Workspace", href: "/workspace" },
    { label: "Career", href: "/career" },
    { label: "Community", href: "/community" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 border-b border-slate-200/50 dark:border-slate-700/50 transition-colors duration-300">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <span className="font-black text-xl text-blue-600 dark:text-blue-400">StackLoad</span>
            </Link>

            {/* Desktop Navigation - Hidden on mobile if filters are taking space, or handled responsibly */}
            <nav className={`hidden md:flex items-center space-x-6 text-sm font-medium ${isTechBlog ? 'lg:flex' : ''}`}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                    pathname.startsWith(item.href)
                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
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

        {/* Mobile Filter View for Tech Blog (Optional: if we want filters visible on mobile header) */}
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

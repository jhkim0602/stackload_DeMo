import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import { GlobalHeader } from "@/components/layout/global-header";
import { GlobalMobileNav } from "@/components/layout/mobile-nav";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    default: "StackLoad - Developer Productivity Platform",
    template: "%s | StackLoad",
  },
  description:
    "Integrated platform for Tech Blogs, AI Interview Practice, and Project Collaboration.",
  keywords: [
    "Tech Blog",
    "AI Interview",
    "Developer Tools",
    "StackLoad",
    "Collaboration",
  ],
  authors: [{ name: "StackLoad Team" }],
  creator: "StackLoad",
  publisher: "StackLoad",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://stackload.dev",
    title: "StackLoad",
    description: "Developer Productivity Platform",
    siteName: "StackLoad",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Suspense fallback={<div className="h-14 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50" />}>
              <GlobalHeader />
            </Suspense>
            <div className="flex-1 pt-14">{children}</div>
            <GlobalMobileNav />
          </div>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

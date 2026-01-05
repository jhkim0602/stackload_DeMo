export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
       {/* Assuming GlobalHeader is handled by RootLayout or we can include it here if needed */}
       {/* For now, just a wrapper content or main area */}
       <div className="flex-1 flex flex-col">
         {children}
       </div>
    </div>
  );
}

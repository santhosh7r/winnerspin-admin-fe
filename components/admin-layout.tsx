"use client";

import { AuthGuard } from "@/components/auth-guard";
import Loader from "@/components/loader";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AdminSidebar, SidebarProvider, useSidebar } from "./admin-sidebar";
import { AdminNav } from "./admin-nav";

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  
  // NAVIGATING STATE
  const [navigating, setNavigating] = useState(false);

  // Instant navigation detection
  useEffect(() => {
    // TRIGGER LOADER INSTANTLY
    setNavigating(true);
    
    // THEME APPLICATION logic
    const applyTheme = () => {
      const html = document.documentElement;
      const stored = localStorage.getItem("theme") || "system";
      const isDark =
        stored === "dark" ||
        (stored === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      html.classList.toggle("dark", isDark);
    };

    applyTheme();

    // Small delay before clearing the navigation loader to allow the page to mount
    const timer = setTimeout(() => setNavigating(false), 300);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", applyTheme);

    return () => {
      clearTimeout(timer);
      mediaQuery.removeEventListener("change", applyTheme);
    };
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 overflow-x-hidden">
      {/* Loader appears here first, instantly on mount and on pathname change */}
      <Loader show={navigating} />
      
      <AdminSidebar />
      <div
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <AdminNav />
        <main className="p-4 lg:p-8 min-h-screen relative">
          <Suspense fallback={<Loader show={true} />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <LayoutInner>{children}</LayoutInner>
      </SidebarProvider>
    </AuthGuard>
  );
}

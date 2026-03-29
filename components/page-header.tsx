"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBack?: boolean;
  backHref?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  showBack = false,
  backHref,
  actions,
  className,
}: PageHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === "/admin/dashboard";
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as "light" | "dark" | "system") || "system";
    setTheme(stored);
  }, []);

  const applyTheme = (t: "light" | "dark" | "system") => {
    const isDark =
      t === "dark" ||
      (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    document.documentElement.classList.toggle("dark", isDark);
  };

  const handleThemeChange = (t: "light" | "dark" | "system") => {
    setTheme(t);
    localStorage.setItem("theme", t);
    applyTheme(t);
  };

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10", className)}>
      <div className="flex items-center gap-5 min-w-0">
        {showBack && (
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0 border border-border bg-card shadow-sm hover:bg-muted transition-all active:scale-95"
            onClick={() => (backHref ? router.push(backHref) : router.back())}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="min-w-0">
          <h1 className="text-[24px] font-bold text-foreground tracking-tight leading-tight">{title}</h1>
          {description && (
            <p className="text-[13px] font-medium text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {/* Only show theme toggle UI on Dashboard page as requested */}
        {isDashboard && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 border-border bg-card shadow-sm hover:bg-muted dark:hover:bg-zinc-900 transition-all active:scale-95"
              >
                {theme === "light" && <Sun className="h-4.5 w-4.5" />}
                {theme === "dark" && <Moon className="h-4.5 w-4.5" />}
                {theme === "system" && <Monitor className="h-4.5 w-4.5" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleThemeChange("light")}>
                <Sun className="mr-2 h-4 w-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                <Moon className="mr-2 h-4 w-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange("system")}>
                <Monitor className="mr-2 h-4 w-4" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {actions && (
          <div className="flex items-center gap-3">{actions}</div>
        )}
      </div>
    </div>
  );
}

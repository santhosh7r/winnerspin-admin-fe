"use client";

import React from "react";
import { cn } from "@/lib/utils";

export default function Loader({ show, inline = false }: { show: boolean; inline?: boolean }) {
  // Removed the artificial delay to ensure the loader appears instantly on navigation
  if (!show) return null;

  if (inline) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 rounded-full border-[3px] border-foreground/10 border-t-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md transition-opacity duration-150"
    )}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-[3px] border-foreground/10" />
          <div className="absolute inset-0 h-10 w-10 rounded-full border-[3px] border-t-foreground animate-spin" />
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40 animate-pulse">
          Loading
        </p>
      </div>
    </div>
  );
}

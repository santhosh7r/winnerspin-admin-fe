"use client";

import Loader from "@/components/loader";
import { dashboardAPI } from "@/lib/api";
import { useEffect, useState } from "react";

import {
    DashboardRecent,
    StatsResponse
} from "@/lib/types";

import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { QuickActions } from "@/components/quick-actions";

export function DashboardContent({ seasonId }: { seasonId: string }) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recent, setRecent] = useState<DashboardRecent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await dashboardAPI.getStats(seasonId);

        if (!data || !data.stats) {
          throw new Error("Dashboard API returned unsuccessful response");
        }

        setStats(data.stats as StatsResponse);
        setRecent({} as DashboardRecent); // Removed recent data fetch since it was removed from UI
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [seasonId]);

  if (loading) return <Loader show />;

  if (error)
    return (
      <div className="p-4 text-red-600 font-semibold">
        Error loading dashboard: {error}
      </div>
    );

  if (!stats || !recent)
    return (
      <div className="p-4 text-muted-foreground">
        No dashboard data available.
      </div>
    );

  return (
    <div className="space-y-6">
      <StatsOverview stats={stats} />
      
      {/* 
         REMOVAL OF LATEST SECTIONS (CUSTOMERS, TRANSACTIONS, WITHDRAWALS) 
         AS REQUESTED BY USER 
      */}
      <div className="grid grid-cols-1 gap-6">
        <QuickActions />
      </div>
    </div>
  );
}

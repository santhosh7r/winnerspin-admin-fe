"use client";

import { useState, useEffect } from "react";
import { seasonAPI } from "@/lib/api";
import { DashboardContent } from "@/components/dashboard/dashboardcontent";
import { PageHeader } from "@/components/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Season {
  _id: string;
  season: string;
}

export default function DashboardPage() {
  const [seasonId, setSeasonId] = useState<string>("");
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeasons() {
      try {
        const res = await seasonAPI.getAll();
        const list: Season[] = res?.seasons ?? [];
        setSeasons(list);

        const stored = localStorage.getItem("selectedSeason");
        const cur = res?.curSeason?._id;
        const selected = stored || cur || list[0]?._id || "";
        setSeasonId(selected);
        if (selected) localStorage.setItem("selectedSeason", selected);
      } catch (err) {
        console.error("Error loading seasons:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSeasons();
  }, []);

  const handleSeasonChange = (id: string) => {
    setSeasonId(id);
    localStorage.setItem("selectedSeason", id);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Winnerspin Admin Dashboard"
        description="Overview of system activity"
        actions={
          <Select value={seasonId} onValueChange={handleSeasonChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.season}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {seasonId && <DashboardContent seasonId={seasonId} />}
    </div>
  );
}

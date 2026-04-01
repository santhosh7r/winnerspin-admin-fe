"use client";

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
import { seasonAPI } from "@/lib/api";
import { useEffect, useState } from "react";

interface Season {
  _id: string;
  season: string;
}

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setSeason } from "@/store/seasonSlice";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const seasonId = useSelector((state: RootState) => state.season.id);

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
        const name = list.find(s => s._id === selected)?.season || "";
        dispatch(setSeason({ id: selected, name }));
      } catch (err) {
        console.error("Error loading seasons:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSeasons();
  }, []);

  const handleSeasonChange = (id: string) => {
    const name = seasons.find(s => s._id === id)?.season || "";
    dispatch(setSeason({ id, name }));
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

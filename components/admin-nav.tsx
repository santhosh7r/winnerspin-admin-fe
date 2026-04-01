"use client";

import { useState, useEffect, useCallback } from "react";
import { seasonAPI } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setSeason } from "@/store/seasonSlice";

export function AdminNav() {
  const dispatch = useDispatch();
  const seasonId = useSelector((state: RootState) => state.season.id);
  
  const [seasons, setSeasons] = useState<{ _id: string; season: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSeasons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await seasonAPI.getAll();
      const list = res?.seasons ?? [];
      setSeasons(list);

      const stored = localStorage.getItem("selectedSeason");
      const cur = res?.curSeason?._id;
      
      // Initialize only if not set in Redux
      if (!seasonId) {
        const selectedId = stored || cur || list[0]?._id || "";
        const selectedName = list.find((s: any) => s._id === selectedId)?.season || "";
        dispatch(setSeason({ id: selectedId, name: selectedName }));
      }
    } catch (err) {
      console.error("Error loading seasons:", err);
    } finally {
      setLoading(false);
    }
  }, [dispatch, seasonId]);

  useEffect(() => {
    loadSeasons();
  }, [loadSeasons]);

  const handleSeasonChange = (id: string) => {
    const name = seasons.find(s => s._id === id)?.season || "";
    dispatch(setSeason({ id, name }));
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/50 bg-background/95 px-4 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-4">
        <span className="text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase whitespace-nowrap">
          Admin Panel <span className="mx-2 opacity-30">|</span> Season View
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center bg-muted/40 rounded-xl px-1">
             <Select value={seasonId} onValueChange={handleSeasonChange}>
                <SelectTrigger className="w-[200px] border-none bg-transparent h-10 shadow-none ring-offset-0 focus:ring-0 font-medium">
                  <SelectValue placeholder={loading ? "Loading..." : "Select Season"} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl bg-card">
                  {seasons.map((s) => (
                    <SelectItem key={s._id} value={s._id} className="rounded-lg py-2.5">
                      {s.season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
        </div>
      </div>
    </header>
  );
}

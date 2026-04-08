"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { SeasonForm, SeasonFormData } from "@/components/season-form";
import { seasonAPI, promoterAPI } from "@/lib/api";

export default function EditSeasonPage() {
  const params = useParams();
  const seasonId = (params?.id as string) || "";
  const [season, setSeason] = useState<Partial<SeasonFormData> | undefined>(
    undefined
  );
  // const [promoters, setPromoters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    if (seasonId) fetchSeasonAndPromoters(seasonId);
  }, [seasonId]);

  const fetchSeasonAndPromoters = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // pass "id" to promoterAPI.getAll since it expects a seasonId (string)
      const [seasonResponse ] = await Promise.all([
        seasonAPI.getById(id),
        promoterAPI.getAll(id),
      ]);

      // normalize possible shapes returned by your API
      const seasonData = (seasonResponse as unknown as { season?: Record<string, unknown> })?.season || seasonResponse;
      const normalizedSeason = seasonData || undefined;

      if (seasonData?.endDate && new Date(seasonData.endDate) < new Date()) {
        setIsReadOnly(true);
      }

      setSeason(normalizedSeason ?? undefined);
      // setPromoters(promotersResponse?.allPromoters ?? promotersResponse ?? []);
    } catch (err) {
      console.error("Failed to fetch season or promoters:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch season data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: SeasonFormData) => {
    try {
      setLoading(true);
      await seasonAPI.update(seasonId, data);
    } catch (err) {
      console.error("Failed to update season:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Season</h1>
        <p className="text-muted-foreground">
          Update season information and promoter assignments
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isReadOnly ? (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 p-4 rounded-lg font-bold">
          This season has ended. Historical seasons cannot be edited.
        </div>
      ) : (
        <SeasonForm initialData={season} onSubmit={handleSubmit} isEditing />
      )}
    </div>
  );
}

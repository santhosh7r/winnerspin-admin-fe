"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PromoterForm, PromoterFormData } from "@/components/promoter-form";
import { promoterAPI } from "@/lib/api";

interface PromoterResponse {
  promoter?: PromoterFormData;
}

export default function EditPromoterPage() {
  const params = useParams();
  const [promoter, setPromoter] = useState<Partial<PromoterFormData> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  useEffect(() => {
    const storedSeason = localStorage.getItem("selectedSeason");
    setSelectedSeason(storedSeason);
  }, []);

  useEffect(() => {
    if (params.id && selectedSeason) {
      fetchPromoter(params.id as string, selectedSeason);
    }
  }, [params.id, selectedSeason]);

  const fetchPromoter = async (id: string, seasonId: string) => {
    try {
      const response: PromoterResponse | PromoterFormData =
        await promoterAPI.getById(id, { seasonId });

      const raw =
        "promoter" in response && response.promoter
          ? response.promoter
          : (response as PromoterFormData);

      const formatted: Partial<PromoterFormData> = {
        userid: String(raw?.userid ?? ""),
        username: String(raw?.username ?? ""),
        email: String(raw?.email ?? ""),
        mobNo: String(raw?.mobNo ?? ""),
        address: String(raw?.address ?? ""),
        city: String(raw?.city ?? ""),
        state: String(raw?.state ?? ""),
        pincode: String(raw?.pincode ?? ""),
        status: (raw as any)?.status === "approved" || (raw as any)?.status === "unapproved" ? (raw as any).status : "unapproved",
      };

      setPromoter(formatted);
    } catch (err) {
      console.error("Failed to fetch promoter:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: PromoterFormData) => {
    if (!selectedSeason) return console.error("No season selected");

    await promoterAPI.updateProfile(params.id as string, {
      ...data,
      selectedSeason,
    });
  };

  if (loading || !promoter) {
    return (
      <div className="space-y-6 mt-15 lg:mt-0">
        <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Promoter</h1>
        <p className="text-muted-foreground">Update promoter information</p>
      </div>

      <PromoterForm initialData={promoter} onSubmit={handleSubmit} isEditing />
    </div>
  );
}

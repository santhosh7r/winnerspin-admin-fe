"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PromoterSelector } from "./promoter-selector";
import { seasonAPI } from "@/lib/api";
import { Loader2, Calendar } from "lucide-react";

export interface SeasonFormData {
  Season: string;
  startDate: string;
  endDate: string;
  amount: number;
  promotersCommission: number;
  promotersRepaymentCommission: number;
  approvedPromoters: string[];
}

interface SeasonFormProps {
  initialData?: Partial<SeasonFormData>;
  onSubmit: (data: SeasonFormData) => Promise<any>;
  isEditing?: boolean;
  hidePromoters?: boolean;
  onCancel?: () => void;
}

export function SeasonForm({
  initialData,
  onSubmit,
  isEditing = false,
  hidePromoters = false,
  onCancel,
}: SeasonFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [promotersLoading, setPromotersLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [previousSeasonPromoters, setPreviousSeasonPromoters] = useState<any[]>([]);

  const [formData, setFormData] = useState<SeasonFormData>({
    Season: initialData?.Season || "",
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
    amount: initialData?.amount || 0,
    promotersCommission: initialData?.promotersCommission || 0,
    promotersRepaymentCommission: initialData?.promotersRepaymentCommission || 0,
    approvedPromoters: initialData?.approvedPromoters || [],
  });

  useEffect(() => {
    if (!isEditing) {
      fetchPreviousSeasonPromoters();
    } else {
      setPromotersLoading(false);
    }
  }, [isEditing]);

  const fetchPreviousSeasonPromoters = async () => {
    try {
      const response = await seasonAPI.getPreviousPromoters() as any;
      const merged = [
        ...(response.approved || []),
        ...(response.nonApproved || []),
      ];
      setPreviousSeasonPromoters(merged);

      setFormData((prev) => ({
        ...prev,
        approvedPromoters: response.approved?.map((p: any) => p._id) || [],
      }));
    } catch (err) {
      console.error("Failed to fetch previous season data:", err);
      setErrorStatus("Failed to fetch previous season promoters");
    } finally {
      setPromotersLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorStatus(null);

    try {
      const res = await onSubmit(formData);
      if (res && res.stay) {
        // do not redirect, handled by parent
      } else {
        router.push("/admin/seasons");
      }
    } catch (err) {
      setErrorStatus(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof SeasonFormData,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-[1400px] h-full bg-black text-white flex flex-col gap-0">
      <div className="flex-1 w-full bg-[#000000]">
        
        <div className="max-w-5xl space-y-8">
          <div className="space-y-1">
             <h1 className="text-3xl font-bold text-white tracking-tight">{isEditing ? "Edit Season" : "Create Season"}</h1>
             <p className="text-zinc-500 font-medium">{isEditing ? "Update season information and promoter selection" : "Set up a new promotional season with approved promoters"}</p>
          </div>

          <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-6 md:p-8 shadow-sm">
            <div className="space-y-1 mb-8">
               <div className="flex items-center gap-2">
                 <Calendar className="h-5 w-5 text-white" />
                 <h2 className="text-lg font-bold text-white tracking-tight">{isEditing ? "Edit Season Details" : "Create New Season"}</h2>
               </div>
               <p className="text-sm text-zinc-500 pl-7">{isEditing ? "Update details" : "Set up a new promotional season"}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 max-w-2xl">
                <Label htmlFor="season" className="text-sm font-semibold text-zinc-300">Season Name</Label>
                <Input
                  id="season"
                  className="h-11 bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                  value={formData.Season}
                  onChange={(e) => handleChange("Season", e.target.value)}
                  placeholder="Summer 2025"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-semibold text-zinc-300">Start Date</Label>
                  <Input
                    id="startDate"
                    className="h-11 bg-black border-zinc-800 text-white focus-visible:ring-zinc-700 dark:[color-scheme:dark]"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-semibold text-zinc-300">End Date</Label>
                  <Input
                    id="endDate"
                    className="h-11 bg-black border-zinc-800 text-white focus-visible:ring-zinc-700 dark:[color-scheme:dark]"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 max-w-2xl">
                <Label htmlFor="amount" className="text-sm font-semibold text-zinc-300">Season Amount (₹)</Label>
                <Input
                  id="amount"
                  className="h-11 bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700 disabled:opacity-50"
                  type="number"
                  value={formData.amount || ""}
                  onChange={(e) => handleChange("amount", Number.parseFloat(e.target.value) || 0)}
                  placeholder="Example: 1000"
                  required
                  min="0"
                  step="0.01"
                  disabled={isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="space-y-2">
                  <Label htmlFor="promotersCommission" className="text-sm font-semibold text-zinc-300">
                    Promoter Commission (₹)
                  </Label>
                  <Input
                    id="promotersCommission"
                    className="h-11 bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700 disabled:opacity-50"
                    type="number"
                    value={formData.promotersCommission || ""}
                    onChange={(e) => handleChange("promotersCommission", Number.parseFloat(e.target.value) || 0)}
                    placeholder="Example: 400"
                    required
                    min="0"
                    step="0.01"
                    disabled={isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promotersRepaymentCommission" className="text-sm font-semibold text-zinc-300">
                    Promoter Repayment Commission (₹)
                  </Label>
                  <Input
                    id="promotersRepaymentCommission"
                    className="h-11 bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700 disabled:opacity-50"
                    type="number"
                    value={formData.promotersRepaymentCommission || ""}
                    onChange={(e) => handleChange("promotersRepaymentCommission", Number.parseFloat(e.target.value) || 0)}
                    placeholder="Example: 50"
                    required
                    min="0"
                    step="0.01"
                    disabled={isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <p className="text-sm text-zinc-500 font-medium">
                  Amount and commissions CANNOT be edited. Only name and dates.
                </p>
              )}

              {errorStatus && (
                <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg flex items-center justify-start mt-4 max-w-4xl">
                  <span className="text-sm text-red-500 font-medium">{errorStatus}</span>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={loading || promotersLoading} className="bg-white text-black hover:bg-zinc-200 font-bold px-8 h-11">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Update Season" : "Create Season"}
                </Button>
                <Button variant="outline" type="button" onClick={() => { if(onCancel) onCancel(); else router.back(); }} disabled={loading} className="border-zinc-800 bg-[#09090b] text-white hover:bg-zinc-900 hover:text-white px-8 h-11 font-bold">
                  Cancel
                </Button>
              </div>
            </form>
          </div>

          {!hidePromoters && (
            <div className="mt-8">
              <PromoterSelector
                promoters={previousSeasonPromoters}
                selectedPromoters={formData.approvedPromoters}
                onSelectionChange={(selected) => handleChange("approvedPromoters", selected)}
                previousSeasonPromoters={previousSeasonPromoters.map((p: any) => p._id)}
                loading={promotersLoading}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

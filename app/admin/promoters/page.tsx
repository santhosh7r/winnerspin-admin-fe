"use client";

import { PageHeader } from "@/components/page-header";
import { PromoterTable } from "@/components/promoter-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardAPI, promoterAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Download, ShieldCheck, ShieldOff, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export type Promoter = {
  _id: string;
  userid: string;
  username: string;
  email: string;
  mobNo: string;
  isActiveInSeason: boolean;
  balance: number;
  recruitedBy: any;
  selfMadeCustomerCount: number;
  directSubPromoterCount: number;
};

export default function PromotersPage() {
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [counts, setCounts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPromoters = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const selectedSeason = localStorage.getItem("selectedSeason");
      if (!selectedSeason)
        throw new Error("No season selected in local storage");

      const [promotersRes, statsRes] = await Promise.all([
        promoterAPI.getAll(selectedSeason),
        dashboardAPI.getStats(selectedSeason)
      ]);

      setPromoters(promotersRes.promoters || []);
      
      if (statsRes && statsRes.stats) {
        setCounts({
          total: statsRes.stats.totalPromoters || 0,
          activeInSeason: statsRes.stats.activeInSeason || 0,
          inactiveInSeason: statsRes.stats.inactiveInSeason || 0,
        });
      } else {
        setCounts(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch promoters"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromoters();
  }, [fetchPromoters]);

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const XLSX = await import("xlsx");

      const rows = promoters.map((p) => ({
        PromoterMongoId: p._id,
        PromoterID: p.userid,
        Username: p.username,
        Email: p.email,
        Phone: p.mobNo,
        ActiveInSeason: p.isActiveInSeason ? "Yes" : "No",
        Balance: p.balance,
        SelfCustomers: p.selfMadeCustomerCount,
        SubPromoters: p.directSubPromoterCount,
        RecruitedBy: p.recruitedBy?.type === "promoter" && p.recruitedBy.promoter
          ? p.recruitedBy.promoter.username
          : "Admin"
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Promoters");

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const filename = `promoters_${now.getFullYear()}-${pad(
        now.getMonth() + 1
      )}-${pad(now.getDate())}_${pad(now.getHours())}${pad(
        now.getMinutes()
      )}.xlsx`;

      XLSX.writeFile(wb, filename);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to export Excel file";
      alert(msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promoters"
        description="Manage promoters and their season activation"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={exporting || promoters.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? "Exporting..." : "Export Excel"}
            </Button>
            <Link href="/admin/create-promoter">
              <Button size="sm">Create Promoter</Button>
            </Link>
          </div>
        }
      />

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : counts && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Promoters",    value: counts.total,            icon: Users,        color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
            { label: "Active This Season", value: counts.activeInSeason,   icon: ShieldCheck,  color: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
            { label: "Inactive",           value: counts.inactiveInSeason, icon: ShieldOff,    color: "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", s.color)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {error ? (
          <div className="p-6 text-sm text-destructive">{error}</div>
        ) : loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <PromoterTable
            promoters={promoters}
            loading={false}
            onUpdate={() => fetchPromoters(false)}
          />
        )}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { promoterAPI } from "@/lib/api";
import { PromoterTable } from "@/components/promoter-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type Promoter = {
  _id: string;
  userid: string;
  username: string;
  email: string;
  mobNo: string;
  isActive: boolean;
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

  const fetchPromoters = useCallback(async () => {
    try {
      setLoading(true);

      const selectedSeason = localStorage.getItem("selectedSeason");
      if (!selectedSeason)
        throw new Error("No season selected in local storage");

      const response = await promoterAPI.getAll(selectedSeason);

      setPromoters(response.promoters || []);
      setCounts(response.counts || null);
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
        GlobalLogin: p.isActive ? "Yes" : "Blocked",
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
    <div className="space-y-8 relative mt-15 lg:mt-0">
      <Loader show={loading} />

      {/* Header + Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Winnerspin Promoters
          </h1>
          <p className="text-muted-foreground">
            Manage promoters in your network
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={exporting || promoters.length === 0}
            title={
              promoters.length === 0
                ? "No data to export"
                : "Download all promoters as Excel"
            }
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Export Excel"}
          </Button>

          <Link href="/admin/create-promoter">
            <Button>Create Promoter</Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      {counts && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Promoters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active This Season</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{counts.activeInSeason}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Not Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{counts.inactiveInSeason}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-10">
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <PromoterTable
            promoters={promoters}
            loading={loading}
            onUpdate={() => {
              fetchPromoters();
            }}
          />
        )}
      </div>
    </div>
  );
}

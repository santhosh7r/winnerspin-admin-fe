"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { promoterAPI } from "@/lib/api";
import { PromoterTable } from "@/components/promoter-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import { Download } from "lucide-react";

type Promoter = {
  _id: string;
  userid: string;
  username: string;
  email: string;
  mobNo: string;
  status: "approved" | "unapproved" | "inactive";
  isActive: boolean;
  balance: number;
  customers: string[];
};

export default function PromotersPage() {
  const [approvedPromoters, setApprovedPromoters] = useState<Promoter[]>([]);
  const [nonApprovedPromoters, setNonApprovedPromoters] = useState<Promoter[]>(
    []
  );
  const [inactivePromoters, setInactivePromoters] = useState<Promoter[]>([]);
  const [allInactivePromoters, setAllInactivePromoters] = useState<Promoter[]>(
    []
  );
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
      // console.log("Promoters API response:", response);

      const normalize = (
        list: Promoter[],
        status: "approved" | "unapproved" | "inactive",
        isActive: boolean
      ): Promoter[] =>
        list.map((p) => ({
          _id: String(p?._id ?? ""),
          userid: String(p?.userid ?? p?.username ?? ""),
          username: String(p?.username ?? ""),
          email: String(p?.email ?? ""),
          mobNo: String(p?.mobNo ?? ""),
          status,
          isActive,
          balance: Number(p?.balance ?? 0),
          customers: Array.isArray(p?.customers)
            ? (p.customers as string[])
            : [],
        }));

      setApprovedPromoters(
        normalize(response.approvedPromoters ?? [], "approved", true)
      );
      setNonApprovedPromoters(
        normalize(response.nonApprovedPromoters ?? [], "unapproved", true)
      );
      setInactivePromoters(
        normalize(response.inactivePromoters ?? [], "inactive", false)
      );
      setAllInactivePromoters(
        normalize(response.allInactivePromoters ?? [], "inactive", true)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch promoters"
      );
    } finally {
      setLoading(false);
    }
  }, []); // ✅ Dependencies for fetchPromoters (none here)

  // ✅ Effect that runs only once and calls the stable function
  useEffect(() => {
    fetchPromoters();
  }, [fetchPromoters]);

  // Merge all unique promoters for export
  const allForExport: Promoter[] = useMemo(() => {
    const map = new Map<string, Promoter>();
    const pushAll = (arr: Promoter[]) => {
      for (const p of arr) map.set(p._id, p);
    };
    pushAll(approvedPromoters);
    pushAll(nonApprovedPromoters);
    pushAll(inactivePromoters);
    pushAll(allInactivePromoters);
    return Array.from(map.values());
  }, [
    approvedPromoters,
    nonApprovedPromoters,
    inactivePromoters,
    allInactivePromoters,
  ]);

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const XLSX = await import("xlsx");

      // ✅ Exclude customers and CustomersCount
      const rows = allForExport.map((p) => ({
        PromoterMongoId: p._id,
        PromoterID: p.userid,
        Username: p.username,
        Email: p.email,
        Phone: p.mobNo,
        Status: p.status,
        Active: p.isActive ? "Yes" : "No",
        Balance: p.balance,
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
            Manage promoters in your systems
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={exporting || allForExport.length === 0}
            title={
              allForExport.length === 0
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

      <div className="space-y-10">
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <PromoterTable
            approvedPromoters={approvedPromoters}
            nonApprovedPromoters={nonApprovedPromoters}
            inactivePromoters={inactivePromoters}
            allInactivePromoters={allInactivePromoters}
            loading={loading}
            onDelete={(id) => {
              const fn = (arr: Promoter[]) => arr.filter((p) => p._id !== id);
              setApprovedPromoters((prev) => fn(prev));
              setNonApprovedPromoters((prev) => fn(prev));
              setInactivePromoters((prev) => fn(prev));
              setAllInactivePromoters((prev) => fn(prev));
            }}
          />
        )}
      </div>
    </div>
  );
}

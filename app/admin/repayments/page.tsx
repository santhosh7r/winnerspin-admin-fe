"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { repaymentAPI, promoterAPI } from "@/lib/api";
import { RepaymentTable } from "@/components/repayment-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { 
  Download, 
  RefreshCw, 
  Search, 
  CheckCircle, 
  Clock, 
  Banknote, 
  XCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Promoter { _id: string; username: string; }

interface Repayment {
  _id: string;
  customer: { _id: string; username: string; promoter: string; cardNo: string; };
  season: { _id: string; season: string; promotersRepaymentCommission: number; amount: number; };
  paymentDate: string;
  installmentNo: number;
  amount: string;
  isVerified: boolean;
  promoterName?: string;
}

function StatCard({ label, value, icon: Icon, colorClass, prefix }: { 
  label: string; 
  value: number; 
  icon: React.ElementType; 
  colorClass: string; 
  prefix?: string;
}) {
  return (
    <div className="bg-card dark:bg-[#0a0a0a] border border-border dark:border-[#1a1a1a] rounded-xl p-5 flex items-center gap-4 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all group shadow-sm">
      <div className={cn("h-11 w-11 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground dark:text-zinc-500 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-2xl font-black text-foreground dark:text-white tracking-tight">
          {prefix}{value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default function RepaymentsPage() {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingIds, setApprovingIds] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const seasonId = typeof window !== "undefined"
    ? localStorage.getItem("selectedSeason") ?? ""
    : "";

  const fetchRepayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const validSeasonId = seasonId || "";

      const [repaymentsRes, promotersRes] = await Promise.all([
        repaymentAPI.getAll(validSeasonId),
        promoterAPI.getAll(validSeasonId),
      ]) as [{ repayments: Repayment[] }, { allPromoters: Promoter[] }];

      const enriched: Repayment[] = (repaymentsRes.repayments || [])
        .filter((r: Repayment) => Number(r.installmentNo) > 1)
        .map((r: Repayment) => {
          const promoter = promotersRes.allPromoters?.find(
            (p: Promoter) => p._id === r.customer.promoter
          );
          return { ...r, promoterName: promoter?.username || "Unknown" };
      });

      setRepayments(enriched);
    } catch (err) {
      const apiErr = err as { response?: { status?: number }; message?: string };
      if (apiErr?.response?.status !== 404) {
        setError(err instanceof Error ? err.message : "Failed to fetch repayments");
      }
      setRepayments([]);
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => { fetchRepayments(); }, [fetchRepayments]);

  const handleApprove = async (installmentId: string, promoterId: string) => {
    setApprovingIds((prev) => [...prev, installmentId]);
    try {
      await repaymentAPI.approve(installmentId, promoterId);
      await fetchRepayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve repayment");
    } finally {
      setApprovingIds((prev) => prev.filter((id) => id !== installmentId));
    }
  };

  const filtered = useMemo(() => {
    return repayments.filter((r) => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || 
        r.customer?.username?.toLowerCase().includes(q) ||
        r.customer?.cardNo?.toLowerCase().includes(q) ||
        r.promoterName?.toLowerCase().includes(q);
      
      const tabMatch = statusFilter === "all" || 
        (statusFilter === "pending" && !r.isVerified) || 
        (statusFilter === "processed" && r.isVerified);
      
      return matchesSearch && tabMatch;
    });
  }, [repayments, search, statusFilter]);

  const pendingCount = repayments.filter(r => !r.isVerified).length;
  const processedCount = repayments.filter(r => r.isVerified).length;

  const handleExportExcel = async () => {
    if (repayments.length === 0) return alert("No repayments to export");
    try {
      setExporting(true);
      const XLSX = await import("xlsx");
      const rows = repayments.map((r) => ({
        "Customer": r.customer?.username ?? "Unknown",
        "Card No":  r.customer?.cardNo ?? "N/A",
        "Season":   r.season?.season ?? "N/A",
        "Promoter": r.promoterName ?? "Unknown",
        "Installment": r.installmentNo ?? "",
        "Amount": `₹${Number(r.amount).toLocaleString()}`,
        "Status": r.isVerified ? "Approved" : "Pending",
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Repayments");
      const filename = `repayments_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 mt-15 lg:mt-0">
      <PageHeader
        title="Winnerspin Repayments"
        description="Manage customer repayments and promoter commission approvals"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchRepayments} disabled={loading} className="bg-transparent border-border hover:bg-muted dark:hover:bg-zinc-900 transition-all font-bold">
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button size="sm" onClick={handleExportExcel} disabled={exporting || repayments.length === 0} className="bg-foreground text-background hover:opacity-90 font-bold">
              <Download className="h-4 w-4 mr-2" />
              {exporting ? "Exporting..." : "Export Excel"}
            </Button>
          </div>
        }
      />

      {error && !loading && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-lg text-sm font-semibold">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button className="ml-auto font-bold hover:underline" onClick={fetchRepayments}>Retry</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl bg-muted dark:bg-zinc-900" />)
        ) : (
          <>
            <StatCard label="Total" value={repayments.length} icon={Banknote} colorClass="bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" />
            <StatCard label="Pending" value={pendingCount} icon={Clock} colorClass="bg-amber-50/50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" />
            <StatCard label="Processed" value={processedCount} icon={CheckCircle} colorClass="bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
          </>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <Tabs defaultValue="all" onValueChange={setStatusFilter} className="w-full">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
            {/* PILL STYLE TABS AS REQUESTED */}
            <TabsList className="bg-zinc-100 dark:bg-[#111] p-1 h-11 rounded-xl">
               {[
                 { value: "all", label: "All", count: repayments.length },
                 { value: "pending", label: "Pending", count: pendingCount },
                 { value: "processed", label: "Processed", count: processedCount },
               ].map((tab) => (
                 <TabsTrigger
                   key={tab.value}
                   value={tab.value}
                   className="rounded-lg px-6 h-9 text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-black dark:data-[state=active]:text-white transition-all text-zinc-500 flex items-center gap-2"
                 >
                   {tab.label} ({tab.count})
                 </TabsTrigger>
               ))}
            </TabsList>

            <div className="flex items-center gap-3 w-full sm:w-auto">
               <div className="relative group flex-1 sm:flex-none sm:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 h-4 w-4" />
                 <Input
                   placeholder="Search..."
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="pl-9 h-10 rounded-lg"
                 />
               </div>
               
               <Select defaultValue="newest">
                 <SelectTrigger className="w-[140px] h-10 rounded-lg font-semibold">
                   <SelectValue placeholder="Sort" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="newest">Newest</SelectItem>
                   <SelectItem value="oldest">Oldest</SelectItem>
                 </SelectContent>
               </Select>
            </div>
          </div>

          <div className="border border-border dark:border-[#1a1a1a] rounded-xl overflow-hidden bg-card dark:bg-transparent">
            <TabsContent value={statusFilter} className="mt-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-muted dark:bg-zinc-900" />)}
                </div>
              ) : (
                <RepaymentTable
                  repayments={filtered}
                  loading={false}
                  onApprove={handleApprove}
                  approvingIds={approvingIds}
                />
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

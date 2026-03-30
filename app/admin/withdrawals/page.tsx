"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WithdrawalTable } from "@/components/withdrawal-table";
import { withdrawalAPI } from "@/lib/api";
import { Withdrawal as GlobalWithdrawal } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Banknote, Clock, CheckCircle, XCircle, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function StatCard({ label, value, icon: Icon, colorClass, prefix }: {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  prefix?: string;
}) {
  return (
    <div className="bg-card dark:bg-[#0a0a0a] border border-border dark:border-[#1a1a1a] rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-all group active:scale-95">
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

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<GlobalWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const season = localStorage.getItem("selectedSeason") || "";
      const res = await withdrawalAPI.getAll(season);
      
      const list = Array.isArray(res?.withdraw)
        ? res.withdraw
        : Array.isArray(res?.withdrawals)
        ? res.withdrawals
        : [];

      setWithdrawals(list);
    } catch (err) {
      console.error("Withdrawals fetch error:", err);
      const apiErr = err as { response?: { status?: number } };
      if (apiErr?.response?.status !== 404) {
        setError("Failed to load withdrawals. Please try again later.");
      }
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleApprove = async (id: string) => {
    try {
      await withdrawalAPI.update(id, "approved");
      setWithdrawals((prev) =>
        prev.map((w) => w._id === id ? { ...w, status: "approved", approvedAt: new Date().toISOString() } : w)
      );
    } catch {
      setError("Failed to approve withdrawal");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await withdrawalAPI.update(id, "rejected");
      setWithdrawals((prev) =>
        prev.map((w) => w._id === id ? { ...w, status: "rejected" } : w)
      );
    } catch {
      setError("Failed to reject withdrawal");
    }
  };

  const filtered = useMemo(() => {
    return withdrawals.filter((w) => {
      const username = (w as unknown as { requester?: { username?: string; userid?: string }; amount: number }).requester?.username || "";
      const userid = (w as unknown as { requester?: { username?: string; userid?: string } }).requester?.userid || "";
      const amount = (w as unknown as { amount: number }).amount;
      const status = w.status;
      const matchesSearch = 
        username.toLowerCase().includes(search.toLowerCase()) ||
        userid.toLowerCase().includes(search.toLowerCase()) ||
        amount.toString().includes(search);
      
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [withdrawals, search, statusFilter]);

  const pendingCount = withdrawals.filter((w) => w.status === "pending").length;
  const approvedCount = withdrawals.filter((w) => w.status === "approved").length;
  const rejectedCount = withdrawals.filter((w) => w.status === "rejected").length;

  const handleExportExcel = async () => {
    if (!withdrawals.length) return alert("No withdrawals to export");
    try {
      setExporting(true);
      const XLSX = await import("xlsx");
      const rows = withdrawals.map((w) => ({
        Promoter: w.requester?.username || "Unknown",
        Amount: w.amount,
        Status: w.status,
        "Request Date": new Date(w.createdAt).toLocaleDateString("en-IN"),
        "Processed Date": w.approvedAt ? new Date(w.approvedAt).toLocaleDateString("en-IN") : "—",
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Withdrawals");
      XLSX.writeFile(wb, "withdrawals.xlsx");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 mt-15 lg:mt-0">
      <PageHeader
        title="Winnerspin Withdrawals"
        description="Manage promoter withdrawal requests"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchWithdrawals} disabled={loading} className="bg-transparent border-border hover:bg-muted dark:hover:bg-zinc-900 transition-all font-bold">
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button size="sm" onClick={handleExportExcel} disabled={exporting || !withdrawals.length} className="bg-foreground text-background hover:opacity-90 font-bold uppercase text-[11px] tracking-widest">
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
          <button className="ml-auto font-bold hover:underline" onClick={fetchWithdrawals}>Retry</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl bg-muted dark:bg-zinc-900" />)
        ) : (
          <>
            <StatCard label="Total" value={withdrawals.length} icon={Banknote} colorClass="bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" />
            <StatCard label="Pending" value={pendingCount} icon={Clock} colorClass="bg-amber-50/50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" />
            <StatCard label="Approved" value={approvedCount} icon={CheckCircle} colorClass="bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
            <StatCard label="Rejected" value={rejectedCount} icon={XCircle} colorClass="bg-rose-50/50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400" />
          </>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <Tabs defaultValue="all" onValueChange={setStatusFilter} className="w-full">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
            {/* PILL STYLE TABS AS REQUESTED */}
            <TabsList className="bg-zinc-100 dark:bg-[#111] p-1 h-11 rounded-xl">
               {[
                 { value: "all", label: "All Requests", count: withdrawals.length },
                 { value: "pending", label: "Pending", count: pendingCount },
                 { value: "approved", label: "Approved", count: approvedCount },
                 { value: "rejected", label: "Rejected", count: rejectedCount },
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-10 rounded-lg font-semibold">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
                <WithdrawalTable
                  withdrawals={filtered}
                  loading={false}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

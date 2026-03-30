"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionTable } from "@/components/transaction-table";
import { TransactionStats } from "@/components/transaction-stats";
import { RecentTransactions } from "@/components/recent-transactions";
import { transactionAPI, seasonAPI, promoterAPI } from "@/lib/api";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Transaction, Promoter, Season } from "@/lib/types";

interface ServerTransaction {
  _id: string;
  type: "credit" | "debit";
  amount: number;
  from: string;
  to: string;
  season: { _id: string; season: string };
  promoter: { username?: string; _id: string; userid?: string };
  customer: { username?: string; _id: string };
  date: string;
  createdAt: string;
  description?: string;
  status: "completed" | "pending" | "failed";
  creditedTo?: "admin" | "promoter";
}

interface ServerWithdrawal {
  _id: string;
  amount: number | string;
  requester: { username?: string; _id: string; userid?: string };
  createdAt: string;
  approvedAt?: string;
  status?: string;
  season?: { _id: string; season: string };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seasonId =
    typeof window !== "undefined"
      ? localStorage.getItem("selectedSeason") || ""
      : "";

  // ===============================
  // 🚀 FETCH DATA (with correct sorting)
  // ===============================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [transactionRes, seasonsRes, promotersRes] = await Promise.all([
        transactionAPI.getAll(),
        seasonAPI.getAll(),
        promoterAPI.getAll(seasonId),
      ]);

      const serverTransactions = transactionRes.transactions ?? [];
      const serverWithdrawals = transactionRes.withdrawals ?? [];

      // ⭐ CREDIT TRANSACTIONS (customer → admin/promoter)
      const mappedCredits: Transaction[] = serverTransactions.map(
        (tx: ServerTransaction) => ({
          id: tx._id,
          _id: tx._id,
          type: "credit",
          creditedTo: tx.to === "admin" ? "admin" : "promoter",
          amount: tx.amount,
          from: tx.customer?.username ?? "Customer",
          to: tx.to === "admin" ? "Admin" : "Promoter",
          seasonId: tx.season?._id ?? "",
          seasonName: tx.season?.season,
          promoterId: tx.promoter?._id,
          promoterName: tx.promoter?.username ?? tx.promoter?.userid,
          customerId: tx.customer?._id,
          customerName: tx.customer?.username,
          date: tx.createdAt, // correct
          status: "completed",
        })
      );

      // ⭐ DEBIT TRANSACTIONS (withdrawals)
      const mappedDebits: Transaction[] = serverWithdrawals.map(
        (w: ServerWithdrawal) => ({
          id: w._id,
          _id: w._id,
          type: "debit",
          amount:
            typeof w.amount === "string" ? parseFloat(w.amount) : w.amount,
          from: "Admin",
          to: w.requester?.username ?? w.requester?.userid ?? "Promoter",
          seasonId: w.season?._id ?? "",
          seasonName: w.season?.season,
          promoterId: w.requester?._id,
          promoterName: w.requester?.username ?? w.requester?.userid,

          // ⭐ MOST IMPORTANT SORTING FIX
          date: w.approvedAt ?? w.createdAt,

          status:
            w.status === "approved"
              ? "completed"
              : w.status === "pending"
              ? "pending"
              : "failed",
        })
      );

      // ⭐ FINAL SORT → REAL latest-first across credits + withdrawals
      const combined: Transaction[] = [...mappedCredits, ...mappedDebits].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTransactions(combined);

      // Normalize seasons
      const seasonsArray: Season[] = Array.isArray(seasonsRes.seasons)
        ? seasonsRes.seasons
        : Array.isArray(seasonsRes)
        ? (seasonsRes as Season[])
        : [];

      // Normalize promoters
      const promotersArray: Promoter[] = Array.isArray(promotersRes.promoters)
        ? promotersRes.promoters
        : Array.isArray(promotersRes)
        ? (promotersRes as Promoter[])
        : [];

      setSeasons(seasonsArray);
      setPromoters(promotersArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===============================
  // 📤 EXPORT EXCEL
  // ===============================
  const rowsForExport = useMemo(() => {
    return transactions.map((t) => ({
      "Transaction ID": t._id,
      Type: t.type === "credit" ? "Credit" : "Debit",
      Amount: `₹${t.amount.toLocaleString()}`,
      From: t.from,
      To: t.to,
      Season: t.seasonName ?? "N/A",
      Date: new Date(t.date).toLocaleDateString("en-IN", {
        dateStyle: "medium",
      }),
      Status:
        t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase(),
    }));
  }, [transactions]);

  const handleExportExcel = async () => {
    try {
      if (transactions.length === 0) {
        alert("No transactions to export");
        return;
      }

      setExporting(true);
      const XLSX = await import("xlsx");

      const ws = XLSX.utils.json_to_sheet(rowsForExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const filename = `transactions_${now.getFullYear()}-${pad(
        now.getMonth() + 1
      )}-${pad(now.getDate())}_${pad(now.getHours())}${pad(
        now.getMinutes()
      )}.xlsx`;

      XLSX.writeFile(wb, filename);
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Failed to export transactions to Excel";
      alert(msg);
    } finally {
      setExporting(false);
    }
  };

  // counts
  const creditTransactions = transactions.filter((t) => t.type === "credit");
  const debitTransactions = transactions.filter((t) => t.type === "debit");
  const creditedToAdminCount = creditTransactions.filter(
    (t) => t.creditedTo === "admin"
  ).length;
  const creditedToPromoterCount = creditTransactions.filter(
    (t) => t.creditedTo === "promoter"
  ).length;

  return (
    <div className="space-y-6 relative mt-15 lg:mt-0">
      <Loader show={loading} />

      {/* Header + Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">
            Track all financial transactions and earnings across the system
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleExportExcel}
          disabled={exporting || transactions.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Exporting..." : "Export Excel"}
        </Button>
      </div>

      <TransactionStats transactions={transactions} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-zinc-100 dark:bg-[#111] p-1 h-11 rounded-xl">
              <TabsTrigger
                value="all"
                className="rounded-lg px-6 h-9 text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-black dark:data-[state=active]:text-white transition-all text-zinc-500"
              >
                All ({transactions.length})
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="rounded-lg px-6 h-9 text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-black dark:data-[state=active]:text-white transition-all text-zinc-500"
              >
                Admin Credits ({creditedToAdminCount})
              </TabsTrigger>
              <TabsTrigger
                value="promoter"
                className="rounded-lg px-6 h-9 text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-black dark:data-[state=active]:text-white transition-all text-zinc-500"
              >
                Promoter Credits ({creditedToPromoterCount})
              </TabsTrigger>
              <TabsTrigger
                value="debits"
                className="rounded-lg px-6 h-9 text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-black dark:data-[state=active]:text-white transition-all text-zinc-500"
              >
                Debits ({debitTransactions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>All Transactions</CardTitle>
                  <CardDescription>
                    Complete transaction history (credits + withdrawals)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionTable
                    transactions={transactions}
                    loading={loading}
                    seasons={seasons}
                    promoters={promoters}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle>Credited to Admin</CardTitle>
                  <CardDescription>
                    Transactions credited to admin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionTable
                    transactions={creditTransactions.filter(
                      (t) => t.creditedTo === "admin"
                    )}
                    loading={loading}
                    seasons={seasons}
                    promoters={promoters}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="promoter">
              <Card>
                <CardHeader>
                  <CardTitle>Credited to Promoter</CardTitle>
                  <CardDescription>
                    Transactions credited to promoters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionTable
                    transactions={creditTransactions.filter(
                      (t) => t.creditedTo === "promoter"
                    )}
                    loading={loading}
                    seasons={seasons}
                    promoters={promoters}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="debits">
              <Card>
                <CardHeader>
                  <CardTitle>Withdrawals (Debits)</CardTitle>
                  <CardDescription>
                    All approved/pending/failed withdrawals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionTable
                    transactions={debitTransactions}
                    loading={loading}
                    seasons={seasons}
                    promoters={promoters}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <RecentTransactions transactions={transactions} loading={loading} />
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

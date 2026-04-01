"use client";

import { CustomerTable } from "@/components/customer-table";
import Loader from "@/components/loader";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { customerAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Download, FileSearch, UserPlus, Users, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ✅ use unified type from lib/types.ts
import type { Customer } from "@/lib/types";

function StatCard({ label, value, icon: Icon, colorClass }: {
  label: string;
  value: number|string;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <div className="bg-card dark:bg-[#0a0a0a] border border-border dark:border-[#1a1a1a] rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-all group active:scale-95">
      <div className={cn("h-11 w-11 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground dark:text-zinc-500 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-2xl font-black text-foreground dark:text-white tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const dispatch = useDispatch();
  const seasonId = useSelector((state: RootState) => state.season.id);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (seasonId) {
      loadCustomers(seasonId);
    }
  }, [seasonId]);

  const loadCustomers = async (sId: string = seasonId) => {
    if (!sId) {
      setError("No season selected");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const statsResponse = await customerAPI.getStats(sId);
      if (statsResponse?.stats) {
        setStats({
          total: statsResponse.stats.totalCustomers || 0,
          pending: statsResponse.stats.pendingRequests || 0,
          approved: statsResponse.stats.approvedToday || 0,
          rejected: statsResponse.stats.totalRejected || 0,
        });
      }

      const response = await customerAPI.getAll(seasonId);
      setCustomers(
        (response.customers || []).map((c: Customer) => ({
          ...c,
          status: c.status ?? (c.isApproved ? "approved" : "pending"),
        }))
      );
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch customers"
      );
    } finally {
      setLoading(false);
    }
  };

  const goToRequests = () => {
    router.push("/admin/requests");
  };

  const rowsForExport = useMemo(() => {
    return customers.map((c) => ({
      Username: c.username,
      Email: c.email,
      "Card Number": c.cardNo ?? "N/A",
      Status: c.status
        ? c.status.charAt(0).toUpperCase() + c.status.slice(1)
        : c.isApproved
        ? "Approved"
        : "Pending",
      "Promoter Name": c.promoterName ?? c.promoter?.username ?? "Unassigned",
      Season:
        Array.isArray(c.seasons) && c.seasons.length > 0
          ? c.seasons
              .map((s) => s.season)
              .filter(Boolean)
              .join(", ")
          : c.seasonName ?? "N/A",
    }));
  }, [customers]);

  const handleExportExcel = async () => {
    try {
      if (customers.length === 0) {
        alert("No customers to export");
        return;
      }
      setExporting(true);
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(rowsForExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Customers");

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const filename = `customers_${now.getFullYear()}-${pad(
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

  const handleDeleteRequest = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    setIsDeleting(true);
    setError(null);
    try {
      await customerAPI.delete(customerToDelete._id);
      setCustomers((prev) =>
        prev.filter((c) => c._id !== customerToDelete._id)
      );
      setCustomerToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete customer");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Loader show={loading} />
      {!loading && (
        <div className="space-y-6 mt-15 lg:mt-0">
          <PageHeader
            title="Winnerspin Customers"
            description="Manage all approved customers"
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleExportExcel}
                  disabled={exporting || customers.length === 0}
                  className="bg-transparent border-border hover:bg-muted font-bold"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {exporting ? "Exporting..." : "Export Excel"}
                </Button>

                <Button
                  onClick={goToRequests}
                  className="bg-black text-white hover:bg-black/90 font-bold uppercase text-[11px] tracking-widest h-10 px-6 rounded-lg dark:bg-white dark:text-black dark:hover:bg-white/90"
                >
                  <FileSearch className="mr-2 h-4 w-4" />
                  Check Requests
                </Button>
              </div>
            }
          />

          {/* Stats Section with Pending and Rejected cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Total Customers" 
              value={stats.total} 
              icon={Users} 
              colorClass="bg-blue-50/50 text-blue-600" 
            />
            <StatCard 
              label="Pending Requests" 
              value={stats.pending} 
              icon={UserPlus} 
              colorClass="bg-amber-50/50 text-amber-600" 
            />
            <StatCard 
              label="Approved Today" 
              value={stats.approved} 
              icon={Users} 
              colorClass="bg-emerald-50/50 text-emerald-600" 
            />
            <StatCard 
              label="Total Rejected" 
              value={stats.rejected} 
              icon={UserX} 
              colorClass="bg-red-50/50 text-red-600" 
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <span>{error}</span>
            </div>
          )}

          {!error && customers.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    No customers found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    No customers found — try refreshing or go to Requests.
                  </p>
                  <button
                    onClick={() => loadCustomers()}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-500"
                  >
                    Refresh
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {!error && customers.length > 0 && (
            <CustomerTable
              customers={customers}
              loading={false}
              showActions={true}
              onDelete={handleDeleteRequest}
              fetchNewCustomers={loadCustomers}
            />
          )}
        </div>
      )}

      <AlertDialog
        open={!!customerToDelete}
        onOpenChange={() => setCustomerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete customer{" "}
              <b>{customerToDelete?.username}</b>? This will permanently remove
              all their associated records, including installments and
              transaction history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

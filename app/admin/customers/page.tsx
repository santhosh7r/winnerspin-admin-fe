

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomerTable } from "@/components/customer-table";
import { Users, Download } from "lucide-react";
import { customerAPI } from "@/lib/api";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";

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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerAPI.getAll();
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

  const stats = {
    total: customers.length,
    approved: customers.filter((c) => c.status === "approved").length,
    pending: customers.filter((c) => c.status === "pending").length,
    rejected: customers.filter((c) => c.status === "rejected").length,
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Winnerspin Customers
              </h1>
              <p className="text-muted-foreground">
                Manage pending customers in your system
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleExportExcel}
                disabled={exporting || customers.length === 0}
                title={
                  customers.length === 0
                    ? "No data to export"
                    : "Export customers to Excel"
                }
              >
                <Download className="mr-2 h-4 w-4" />
                {exporting ? "Exporting..." : "Export Excel"}
              </Button>

              <button
                onClick={goToRequests}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-black/15 hover:text-black"
              >
                Check New Customer Requests
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
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
                    onClick={loadCustomers}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-500"
                  >
                    Refresh
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {!error && customers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Approved Customers</CardTitle>
                <CardDescription>View and manage all customers</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerTable
                  customers={customers}
                  loading={false}
                  showActions={true}
                  onDelete={handleDeleteRequest}
                />
              </CardContent>
            </Card>
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

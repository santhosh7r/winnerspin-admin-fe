"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomerTable } from "@/components/customer-table";
import { RejectionDialog } from "@/components/rejection-dialog";
import { customerAPI } from "@/lib/api";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import Loader from "@/components/loader";
import { PageHeader } from "@/components/page-header";

interface Customer {
  _id: string;
  username: string;
  email: string;
  mobile?: string;
  phone?: string;
  cardNo?: string;
  status: "pending" | "approved" | "rejected";
  promoterId?: string;
  promoterName?: string;
  seasonId?: string;
  seasonName?: string;
  createdAt: string;
}

export default function RequestsPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectionCustomer, setRejectionCustomer] = useState<Customer | null>(
    null
  );

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchNewCustomers();
  }, []);

  const fetchNewCustomers = async () => {
    const seasonId = typeof window !== "undefined" ? localStorage.getItem("selectedSeason") : null;
    if (!seasonId) {
      setError("No season selected");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const statsResponse = await customerAPI.getRequestStats(seasonId);
      if (statsResponse?.stats) {
        setStats({
          pending: statsResponse.stats.pendingRequests || 0,
          approved: statsResponse.stats.approvedToday || 0,
          rejected: statsResponse.stats.rejectedToday || 0,
        });
      }

      const response = await customerAPI.getNew(seasonId);
      setCustomers(response.customers || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch new customers"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (customer: {
    customerId: string;
    promoterId: string;
    seasonId: string;
  }) => {
    try {
      await customerAPI.approve(customer);
      setCustomers((prev) => prev.filter((c) => c._id !== customer.customerId));
      fetchNewCustomers(); // Refresh stats after approval
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve customer"
      );
    }
  };

  const handleReject = async (customerId: string) => {
    try {
      await customerAPI.reject(customerId);
      setCustomers((prev) => prev.filter((c) => c._id !== customerId));
      setRejectionCustomer(null);
      fetchNewCustomers(); // Refresh stats after rejection
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject customer"
      );
    }
  };

  return (
    <div className="space-y-6 relative mt-15 lg:mt-0">
      <Loader show={loading} />

      <PageHeader 
        title="Customer Requests"
        description="Review and approve pending customer applications"
        showBack={true}
      />

      {/* Stats Cards - Polished Premium Look */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-all group">
          <div className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">Pending Requests</p>
            <p className="text-2xl font-black text-foreground tracking-tight">{stats.pending}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-all group">
          <div className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">Approved Today</p>
            <p className="text-2xl font-black text-foreground tracking-tight">{stats.approved}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-all group">
          <div className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">Rejected Today</p>
            <p className="text-2xl font-black text-foreground tracking-tight">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Pending Requests Table */}
      <Card className="border-border/50 shadow-sm overflow-hidden rounded-xl">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-lg font-bold tracking-tight">Pending Customer Requests</CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            {customers.length === 0
              ? "All caught up"
              : "Review high-priority applications"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {customers.length === 0 && !loading ? (
            <div className="text-center py-24">
              <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">All caught up!</h3>
              <p className="text-muted-foreground mt-2 max-w-[280px] mx-auto text-sm font-medium">
                No pending customer requests to review at this moment.
              </p>
            </div>
          ) : (
            <CustomerTable
              customers={customers}
              loading={loading}
              onReject={setRejectionCustomer}
              handleApprove={handleApprove}
              fetchNewCustomers={fetchNewCustomers}
            />
          )}
        </CardContent>
      </Card>

      <RejectionDialog
        customer={rejectionCustomer as any}
        open={!!rejectionCustomer}
        onOpenChange={(open) => !open && setRejectionCustomer(null)}
        onReject={handleReject}
      />

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3">
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

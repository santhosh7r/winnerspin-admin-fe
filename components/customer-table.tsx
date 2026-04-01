"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  Edit2,
  Loader2,
} from "lucide-react";
import type { Customer } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { customerAPI, seasonAPI } from "@/lib/api";
import { useEffect } from "react";

// ----------------------
// TYPES
// ----------------------

interface CustomerTableProps {
  customers: Customer[];
  loading?: boolean;
  showActions?: boolean;
  onReject?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  handleApprove?: (customer: {
    customerId: string;
    promoterId: string;
    seasonId: string;
  }) => Promise<unknown> | void;
  fetchNewCustomers?: () => Promise<void>;
}

// ----------------------
// COMPONENT
// ----------------------
export function CustomerTable({
  customers,
  loading,
  showActions = true,
  onReject,
  handleApprove,
  onDelete,
  fetchNewCustomers,
}: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [promoterFilter, setPromoterFilter] = useState("all");
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // ✅ Product Detail States
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [productDetailsText, setProductDetailsText] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    const fetchSeasonStatus = async () => {
      try {
        const seasonId =
          typeof window !== "undefined"
            ? localStorage.getItem("selectedSeason")
            : null;
        if (!seasonId) return;
        const seasonRes = (await seasonAPI.getById(seasonId)) as any;
        const endDate = seasonRes?.season?.endDate || seasonRes?.endDate;
        if (endDate) {
          setIsReadOnly(new Date(endDate) < new Date());
        }
      } catch (err) {
        console.error("Failed to fetch season status", err);
      }
    };
    fetchSeasonStatus();
  }, []);

  const handleUpdateProductDetails = async () => {
    if (!editingCustomer) return;
    try {
      setSavingDetails(true);
      await customerAPI.updateProductDetails(
        editingCustomer._id,
        productDetailsText
      );
      // Update local state if needed (re-fetch handled by parent usually)
      if (fetchNewCustomers) await fetchNewCustomers();
      setEditingCustomer(null);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to update product details"
      );
    } finally {
      setSavingDetails(false);
    }
  };
  
  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 40;

  // Filter logic
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.cardNo &&
        customer.cardNo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter;
    const matchesPromoter =
      promoterFilter === "all" || customer.promoterName === promoterFilter;

    return matchesSearch && matchesStatus && matchesPromoter;
  });

  // ✅ Pagination Calculations
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const uniquePromoters = Array.from(
    new Set(customers.map((c) => c.promoterName).filter(Boolean))
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="h-10 bg-muted animate-pulse rounded flex-1" />
          <div className="h-10 bg-muted animate-pulse rounded w-32" />
          <div className="h-10 bg-muted animate-pulse rounded w-32" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, email, or card number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // reset to first page on search
            }}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={promoterFilter} onValueChange={(v) => { setPromoterFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Promoter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Promoters</SelectItem>
            {uniquePromoters.map((promoter) => (
              <SelectItem key={promoter} value={promoter!}>
                {promoter}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold py-4 uppercase text-[10px] tracking-widest px-6">Username</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Email</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Mobile</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Card Number</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Promoter</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Season</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Created</TableHead>
              {showActions && (
                <TableHead className="text-right pr-6 uppercase text-[10px] tracking-widest">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedCustomers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-12 text-muted-foreground font-semibold"
                >
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              paginatedCustomers.map((customer) => (
                <TableRow key={customer._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-bold py-4 px-6 truncate max-w-[200px]">
                    <div className="flex flex-col gap-1.5">
                      <span className="leading-none">{customer.username}</span>
                      {customer.productDetails ? (
                        <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-[10px] w-fit font-bold uppercase tracking-wider">
                          <Package className="h-3 w-3" />
                          {customer.productDetails}
                        </div>
                      ) : (
                        !isReadOnly && customer.status === "approved" && (
                          <button
                            onClick={() => {
                              setEditingCustomer(customer);
                              setProductDetailsText("");
                            }}
                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-bold uppercase tracking-wider"
                          >
                            <Plus className="h-3 w-3" />
                            Add Product
                          </button>
                        )
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.mobile || customer.phone || "N/A"}</TableCell>
                  <TableCell className="font-mono text-xs">{customer.cardNo || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn("px-3 border-none font-bold", getStatusColor(customer.status))}
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">
                    {customer.promoter?.username || "Unassigned"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.seasons && customer.seasons.length > 0
                      ? customer.seasons.map((s) => s.season).join(", ")
                      : "N/A"}
                  </TableCell>

                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </TableCell>

                  {showActions && (
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/customers/${customer._id}`} className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>

                          {!isReadOnly && customer.status === "approved" && (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                setEditingCustomer(customer);
                                setProductDetailsText(
                                  customer.productDetails || ""
                                );
                              }}
                            >
                              {customer.productDetails ? (
                                <>
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Edit Product
                                </>
                              ) : (
                                <>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Product
                                </>
                              )}
                            </DropdownMenuItem>
                          )}

                          {customer.status === "pending" && handleApprove && (
                            <DropdownMenuItem
                              disabled={approvingId === customer._id}
                              className="cursor-pointer"
                              onClick={async () => {
                                if (!handleApprove || approvingId) return;
                                setApprovingId(customer._id);
                                try {
                                  await handleApprove({
                                    customerId: customer._id?.toString() || "",
                                    promoterId:
                                      customer.promoter?._id?.toString() || "",
                                    seasonId:
                                      (customer as any).season?.toString() || customer.seasonId || customer.seasons?.[0]?._id?.toString() ||
                                      "",
                                  });
                                } finally {
                                  setApprovingId(null);
                                  if (fetchNewCustomers) {
                                    await fetchNewCustomers();
                                  }
                                }
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              {approvingId === customer._id
                                ? "Approving..."
                                : "Approve"}
                            </DropdownMenuItem>
                          )}

                          {onDelete && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => onDelete(customer)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}

                          {customer.status === "pending" && onReject && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => onReject(customer)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-2 px-1">
          <p className="text-sm font-semibold text-muted-foreground/60 uppercase tracking-widest">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems}
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-4 rounded-lg font-bold"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center gap-2 mx-2">
               <span className="text-sm font-bold">{currentPage} / {totalPages}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-4 rounded-lg font-bold"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
      {/* ✅ Product Detail Edit Modal */}
      <Dialog
        open={!!editingCustomer}
        onOpenChange={(open) => !open && setEditingCustomer(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {editingCustomer?.productDetails ? "Edit" : "Add"} Product Details
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Customer: {editingCustomer?.username}
            </p>
            <Textarea
              value={productDetailsText}
              onChange={(e) => setProductDetailsText(e.target.value)}
              placeholder="Enter product details (e.g., Size: XL, Color: Blue)..."
              className="min-h-[150px] resize-y"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingCustomer(null)}
              disabled={savingDetails}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProductDetails}
              disabled={savingDetails}
              className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black font-bold"
            >
              {savingDetails && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingCustomer?.productDetails ? "Update" : "Add"} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

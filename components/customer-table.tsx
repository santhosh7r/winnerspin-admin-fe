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
import { MoreHorizontal, Eye, Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Customer } from "@/lib/types";
import { cn } from "@/lib/utils";

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
                  <TableCell className="font-bold py-4 px-6 truncate max-w-[150px]">
                    {customer.username}
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
                                      customer.seasons?.[0]?._id?.toString() ||
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
    </div>
  );
}

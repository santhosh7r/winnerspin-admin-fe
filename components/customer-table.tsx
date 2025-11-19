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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Eye, Search, Trash2 } from "lucide-react";

// ----------------------
// TYPES
// ----------------------
interface Season {
  _id: string;
  season?: string;
}

interface Promoter {
  _id: string;
  username?: string;
}

interface Customer {
  _id: string;
  username: string;
  email: string;
  cardNo?: string;
  status: "pending" | "approved" | "rejected";
  // promoterId?: string;
  promoterName?: string;
  // seasonId?: string;
  seasonName?: string;
  createdAt: string;
  promoter?: Promoter;
  seasons?: Season[];
}

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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
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

        <Select value={promoterFilter} onValueChange={setPromoterFilter}>
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
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Card Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Promoter</TableHead>
              <TableHead>Season</TableHead>
              <TableHead>Created</TableHead>
              {showActions && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 8 : 7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell className="font-medium">
                    {customer.username}
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.cardNo || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(customer.status)}
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {customer.promoter?.username || "Unassigned"}
                  </TableCell>
                  <TableCell>
                    {customer.seasons && customer.seasons.length > 0
                      ? customer.seasons.map((s) => s.season).join(", ")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </TableCell>

                  {showActions && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/customers/${customer._id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>

                          {customer.status === "pending" && handleApprove && (
                            <DropdownMenuItem
                              disabled={approvingId === customer._id}
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
                              className="text-destructive"
                              onClick={() => onDelete(customer)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}

                          {customer.status === "pending" && onReject && (
                            <DropdownMenuItem
                              className="text-destructive"
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

      {/* Pagination placeholder */}
      {filteredCustomers.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCustomers.length} customers
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

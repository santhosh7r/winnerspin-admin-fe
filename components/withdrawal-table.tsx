"use client";

import { useState } from "react";
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
import { MoreHorizontal, Check, X, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Withdrawal } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ExtendedWithdrawal extends Withdrawal {
  requester?: {
    _id?: string;
    userid?: string;
    username?: string;
  };
  approvedAt?: string;
  requestDate?: string;
}

interface WithdrawalTableProps {
  withdrawals: ExtendedWithdrawal[];
  loading?: boolean;
  onApprove: (withdrawalId: string) => void;
  onReject: (withdrawalId: string) => void;
}

export function WithdrawalTable({
  withdrawals,
  loading,
  onApprove,
  onReject,
}: WithdrawalTableProps) {
  const [actionWithdrawal, setActionWithdrawal] = useState<{
    withdrawal: ExtendedWithdrawal;
    action: "approve" | "reject";
  } | null>(null);

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 40;

  const handleAction = () => {
    if (!actionWithdrawal) return;
    if (actionWithdrawal.action === "approve") {
      onApprove(actionWithdrawal.withdrawal._id);
    } else {
      onReject(actionWithdrawal.withdrawal._id);
    }
    setActionWithdrawal(null);
  };

  // ✅ Pagination calculations
  const totalItems = withdrawals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWithdrawals = withdrawals.slice(startIndex, startIndex + itemsPerPage);

  if (withdrawals.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/40 gap-4">
        <Clock className="h-10 w-10 opacity-20" />
        <p className="text-sm font-semibold tracking-wider uppercase">No withdrawals found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 dark:bg-[#0a0a0a]">
            <TableHead className="font-bold py-4 px-6 uppercase text-[10px] tracking-widest">Promoter</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest">Amount</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest">Request Date</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest">Processed Date</TableHead>
            <TableHead className="font-bold text-right pr-6 uppercase text-[10px] tracking-widest">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedWithdrawals.map((w) => (
            <TableRow key={w._id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="py-4 px-6 font-semibold">
                <div className="flex flex-col">
                  <span>{w.requester?.username || "Unknown"}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">
                    {w.requester?.userid || "N/A"}
                  </span>
                </div>
              </TableCell>

              <TableCell className="font-bold text-base">
                ₹{Number(w.amount).toLocaleString()}
              </TableCell>

              <TableCell>
                {w.status === "approved" ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold border-none px-3">
                    Approved
                  </Badge>
                ) : w.status === "pending" ? (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-bold border-none px-3">
                     Pending
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 font-bold border-none px-3">
                     Rejected
                  </Badge>
                )}
              </TableCell>

              <TableCell className="text-muted-foreground">
                {new Date(w.requestDate ?? w.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </TableCell>

              <TableCell className="text-muted-foreground">
                {w.status === "approved" && w.approvedAt ? 
                  new Date(w.approvedAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"}
              </TableCell>

              <TableCell className="text-right pr-6">
                {w.status === "pending" ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-full transition-all">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-emerald-600 focus:text-emerald-600 font-bold cursor-pointer"
                        onClick={() => setActionWithdrawal({ withdrawal: w, action: "approve" })}
                      >
                        <Check className="mr-2 h-4 w-4" /> Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-rose-600 focus:text-rose-600 font-bold cursor-pointer"
                        onClick={() => setActionWithdrawal({ withdrawal: w, action: "reject" })}
                      >
                        <X className="mr-2 h-4 w-4" /> Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest capitalize">{w.status}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ✅ Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-6 px-6 border-t border-border">
          <p className="text-sm font-semibold text-muted-foreground/60 uppercase tracking-widest transition-opacity duration-300">
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
            <div className="flex items-center gap-2 mx-4">
               <span className="text-sm font-black">{currentPage} / {totalPages}</span>
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

      <AlertDialog
        open={!!actionWithdrawal}
        onOpenChange={() => setActionWithdrawal(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold tracking-tight">
              {actionWithdrawal?.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] font-medium text-muted-foreground mt-2">
              Are you sure you want to {actionWithdrawal?.action} the withdrawal of <span className="text-foreground dark:text-white font-bold tracking-tighter">₹{Number(actionWithdrawal?.withdrawal.amount).toLocaleString()}</span> from {actionWithdrawal?.withdrawal.requester?.username}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="font-bold border rounded-lg h-10 px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={cn(
                "font-bold rounded-lg h-10 px-8 transition-opacity uppercase text-[11px] tracking-widest",
                actionWithdrawal?.action === "approve"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20 shadow-lg"
                  : "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/20 shadow-lg"
              )}
            >
              Confirm {actionWithdrawal?.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

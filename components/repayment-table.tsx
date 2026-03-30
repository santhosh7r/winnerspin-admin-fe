"use client";

import { useState, useMemo } from "react";
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
import { CheckCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";

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

interface RepaymentTableProps {
  repayments: Repayment[];
  loading: boolean;
  onApprove: (installmentId: string, promoterId: string) => void;
  approvingIds: string[];
}

export function RepaymentTable({
  repayments,
  loading,
  onApprove,
  approvingIds,
}: RepaymentTableProps) {
  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 40;

  // ✅ Pagination logic
  const totalItems = repayments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRepayments = useMemo(() => repayments.slice(startIndex, startIndex + itemsPerPage), [repayments, startIndex]);

  if (repayments.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/40 gap-4">
        <Clock className="h-10 w-10 opacity-20" />
        <p className="text-sm font-semibold tracking-wider uppercase">No repayments found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 dark:bg-[#0a0a0a]">
            <TableHead className="font-bold py-4 uppercase text-[10px] tracking-widest px-6">Customer</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest">Card No</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest">Season</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest">Installment</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest">Amount</TableHead>
            <TableHead className="font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
            <TableHead className="font-bold text-right pr-6 uppercase text-[10px] tracking-widest">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedRepayments.map((r) => (
            <TableRow key={r._id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-bold py-4 tabular-nums px-6">
                {r.customer.username}
              </TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs">
                {r.customer.cardNo || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground font-medium">
                {r.season.season}
              </TableCell>
              <TableCell className="text-muted-foreground font-black text-xs">
                {r.installmentNo}
              </TableCell>
              <TableCell className="font-bold">
                ₹{Number(r.amount).toLocaleString()}
              </TableCell>
              <TableCell>
                {r.isVerified ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold border-none px-3">
                    Approved
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-bold border-none px-3">
                    Pending
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right pr-6">
                {!r.isVerified ? (
                  <Button
                    size="sm"
                    className="bg-black hover:bg-black/90 text-[11px] font-bold uppercase tracking-widest dark:bg-white dark:text-black dark:hover:bg-white/90"
                    disabled={approvingIds.includes(r._id)}
                    onClick={() => onApprove(r._id, r.customer.promoter)}
                  >
                    {approvingIds.includes(r._id) ? "Approving..." : "Approve"}
                  </Button>
                ) : (
                  <div className="flex items-center justify-end text-emerald-600 gap-1.5 font-bold uppercase text-[10px] tracking-widest">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Verified
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ✅ Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-6 border-t border-border px-6">
          <p className="text-sm font-semibold text-muted-foreground/60 uppercase tracking-widest">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems}
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-4 rounded-lg font-bold transition-all disabled:opacity-30" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center gap-1 mx-2">
              <span className="text-sm font-black">{currentPage} / {totalPages}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-4 rounded-lg font-bold transition-all disabled:opacity-30" 
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

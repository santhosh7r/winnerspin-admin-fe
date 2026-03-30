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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Transaction, Season, Promoter } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
  seasons: Season[];
  promoters: Promoter[];
}

export function TransactionTable({
  transactions,
  loading,
  promoters,
}: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "credit" | "debit">("all");
  const [seasonFilter] = useState<"all" | string>("all");
  const [promoterFilter, setPromoterFilter] = useState<"all" | string>("all");
  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 40;

  // ✅ Fix: safely cast onValueChange handler to match Radix Select
  const handleTypeFilterChange = (value: string) => {
    if (value === "credit" || value === "debit" || value === "all") {
      setTypeFilter(value as "all" | "credit" | "debit");
      setCurrentPage(1);
    }
  };

  const handlePromoterFilterChange = (value: string) => {
    setPromoterFilter(value);
    setCurrentPage(1);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.to.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesSeason =
      seasonFilter === "all" || transaction.seasonId === seasonFilter;
    const matchesPromoter =
      promoterFilter === "all" || transaction.promoterId === promoterFilter;

    return matchesSearch && matchesType && matchesSeason && matchesPromoter;
  });

  // ✅ Calculate pages
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const getTypeColor = (type: Transaction["type"]) => {
    switch (type) {
      case "credit":
        return "bg-green-100 dark:bg-emerald-500/10 text-green-800 dark:text-emerald-400";
      case "debit":
        return "bg-red-100 dark:bg-rose-500/10 text-red-800 dark:text-rose-400";
      default:
        return "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-400";
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-emerald-500/10 text-green-800 dark:text-emerald-400";
      case "pending":
        return "bg-yellow-100 dark:bg-amber-500/10 text-yellow-800 dark:text-amber-400";
      case "failed":
        return "bg-red-100 dark:bg-rose-500/10 text-red-800 dark:text-rose-400";
      default:
        return "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-400";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded" />
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
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10 h-10 rounded-lg"
          />
        </div>

        <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
          <SelectTrigger className="w-[120px] h-10 rounded-lg">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="credit">Credit</SelectItem>
            <SelectItem value="debit">Debit</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={promoterFilter}
          onValueChange={handlePromoterFilterChange}
        >
          <SelectTrigger className="w-[150px] h-10 rounded-lg">
            <SelectValue placeholder="Promoter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Promoters</SelectItem>
            {promoters.map((p) => (
              <SelectItem key={p._id} value={p._id}>
                {p.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden bg-card dark:bg-transparent dark:border-[#1a1a1a]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 dark:bg-[#0a0a0a]">
              <TableHead className="font-bold py-4 px-6 uppercase text-[10px] tracking-widest">Transaction ID</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Type</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Amount</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">From</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">To</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Season</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Date</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-muted-foreground font-semibold"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs px-6 py-4">
                    {transaction.id}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {transaction.type === "credit" ? (
                        <ArrowDownLeft className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5 text-red-600" />
                      )}
                      <Badge
                        variant="secondary"
                        className={cn("px-2 border-none font-bold", getTypeColor(transaction.type))}
                      >
                        {transaction.type}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell className="font-bold">
                    ₹{transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-semibold text-zinc-700 dark:text-zinc-300">{transaction.from}</TableCell>
                  <TableCell className="font-semibold text-zinc-700 dark:text-zinc-300">{transaction.to}</TableCell>
                  <TableCell className="text-muted-foreground">{transaction.seasonName || "N/A"}</TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(transaction.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn("px-2 border-none font-bold", getStatusColor(transaction.status))}
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
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
              <span className="text-sm font-black">{currentPage}</span>
              <span className="text-sm font-bold text-muted-foreground/40">/</span>
              <span className="text-sm font-bold text-muted-foreground/40">{totalPages}</span>
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

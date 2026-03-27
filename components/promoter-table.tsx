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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Eye, Power, AlertCircle, PlayCircle, StopCircle, UserMinus } from "lucide-react";
import { promoterAPI } from "@/lib/api";
import { Promoter } from "@/app/admin/promoters/page";

interface PromoterTableProps {
  promoters: Promoter[];
  loading?: boolean;
  onUpdate: () => void;
}

export function PromoterTable({
  promoters,
  loading,
  onUpdate,
}: PromoterTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPromoters = promoters.filter((p) => {
    const s = searchTerm.toLowerCase();
    return (
      (p.username ?? "").toLowerCase().includes(s) ||
      (p.email ?? "").toLowerCase().includes(s) ||
      (p.userid ?? "").toLowerCase().includes(s)
    );
  });

  const handleToggleGlobalLogin = async (promoter: Promoter) => {
    const confirmMessage = promoter.isActive
      ? "⚠ Deactivating this promoter will block their login access globally. Their network remains intact."
      : "Activate this promoter to allow them to login globally?";

    if (confirm(confirmMessage)) {
      try {
        await promoterAPI.toggleStatus(promoter._id, !promoter.isActive);
        onUpdate();
      } catch (error) {
        alert(error instanceof Error ? error.message : "Failed to toggle global login");
      }
    }
  };

  const handleToggleSeason = async (promoter: Promoter, activate: boolean) => {
    try {
      const selectedSeason = localStorage.getItem("selectedSeason");
      if (!selectedSeason) return alert("Select a season first!");
      await promoterAPI.activateForSeason(promoter._id, selectedSeason, activate);
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to toggle season status");
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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search promoters by name, email, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Recruited By</TableHead>
              <TableHead>Season Active</TableHead>
              <TableHead>Self Customers</TableHead>
              <TableHead>Sub-Promoters</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPromoters.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  No promoters found
                </TableCell>
              </TableRow>
            ) : (
              filteredPromoters.map((promoter) => (
                <TableRow key={promoter._id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {promoter.userid}
                  </TableCell>
                  <TableCell>{promoter.username}</TableCell>
                  <TableCell>
                    {promoter.recruitedBy?.type === "promoter" && promoter.recruitedBy.promoter
                      ? promoter.recruitedBy.promoter.username
                      : "Admin"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={promoter.isActiveInSeason ? "default" : "secondary"}
                      className={promoter.isActiveInSeason ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                    >
                      {promoter.isActiveInSeason ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{promoter.selfMadeCustomerCount || 0}</TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/promoters/${promoter._id}/network`}
                      className="text-blue-600 hover:underline hover:text-blue-800"
                    >
                      {promoter.directSubPromoterCount || 0}
                    </Link>
                  </TableCell>
                  <TableCell>
                    ₹{promoter.balance?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={promoter.isActive ? "outline" : "destructive"}>
                      {promoter.isActive ? "Can Login" : "Blocked"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/promoters/${promoter._id}`}>
                            <AlertCircle className="mr-2 h-4 w-4" />
                            View Profile
                          </Link>
                        </DropdownMenuItem>

                        {promoter.isActiveInSeason ? (
                          <DropdownMenuItem onClick={() => handleToggleSeason(promoter, false)}>
                            <StopCircle className="mr-2 h-4 w-4 text-orange-500" />
                            Deactivate for Season
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleToggleSeason(promoter, true)}>
                            <PlayCircle className="mr-2 h-4 w-4 text-green-500" />
                            Activate for Season
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          className={promoter.isActive ? "text-red-500" : "text-green-500"}
                          onClick={() => handleToggleGlobalLogin(promoter)}
                        >
                          {promoter.isActive ? (
                            <>
                              <UserMinus className="mr-2 h-4 w-4" /> Block Login
                            </>
                          ) : (
                            <>
                              <Power className="mr-2 h-4 w-4" /> Unblock Login
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

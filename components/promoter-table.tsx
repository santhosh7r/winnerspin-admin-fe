"use client";

import { Promoter } from "@/app/admin/promoters/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { promoterAPI } from "@/lib/api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AlertCircle, Eye, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface PromoterTableProps {
  promoters: Promoter[];
  loading?: boolean;
  onUpdate?: () => void;
}

export function PromoterTable({
  promoters,
  loading,
  onUpdate,
}: PromoterTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggleSeason = async (promoterId: string, currentStatus: boolean) => {
    try {
      const selectedSeason = localStorage.getItem("selectedSeason");
      if (!selectedSeason) {
        alert("Please select a season first");
        return;
      }
      setToggling(promoterId);
      await promoterAPI.updateProfile(promoterId, {
        selectedSeason,
        status: currentStatus ? "unapproved" : "approved"
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setToggling(null);
    }
  };

  const filteredPromoters = promoters.filter((p) => {
    const s = searchTerm.toLowerCase();
    return (
      (p.username ?? "").toLowerCase().includes(s) ||
      (p.email ?? "").toLowerCase().includes(s) ||
      (p.userid ?? "").toLowerCase().includes(s)
    );
  });

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
              <TableHead>Mobile</TableHead>
              <TableHead>Season Active</TableHead>
              <TableHead>Recruited By</TableHead>
              <TableHead>Sub-Promoters</TableHead>
              <TableHead>Customers</TableHead>
              <TableHead>Balance</TableHead>
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
                  <TableCell>{promoter.mobNo}</TableCell>
                  <TableCell>
                    <Badge variant={promoter.isActiveInSeason ? "default" : "secondary"} className={promoter.isActiveInSeason ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                      {promoter.isActiveInSeason ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {promoter.recruitedBy?.type === "promoter" && promoter.recruitedBy.promoter
                      ? promoter.recruitedBy.promoter.username
                      : "Admin"}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/promoters/${promoter._id}/network`}
                      className="text-blue-600 hover:underline hover:text-blue-800"
                    >
                      {promoter.directSubPromoterCount || 0}
                    </Link>
                  </TableCell>
                  <TableCell>{promoter.selfMadeCustomerCount || 0}</TableCell>
                  <TableCell>
                    ₹{promoter.balance?.toLocaleString() || 0}
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
                        <DropdownMenuItem disabled={toggling === promoter._id} onSelect={(e) => {
                          e.preventDefault();
                          handleToggleSeason(promoter._id, promoter.isActiveInSeason);
                        }}>
                          {promoter.isActiveInSeason ? "Make Inactive" : "Make Active"}
                        </DropdownMenuItem>                      </DropdownMenuContent>
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

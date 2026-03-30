"use client";

import { useCallback, useEffect, useState } from "react";
import { promoterAPI } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Network, Eye } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export type Promoter = {
  _id: string;
  userid: string;
  username: string;
  email: string;
  mobNo: string;
  isActive: boolean;
  isActiveInSeason: boolean;
  balance: number;
  recruitedBy?: any;
};

export default function PromoterNetworkListPage() {
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchPromoters = useCallback(async () => {
    try {
      setLoading(true);
      const selectedSeason = localStorage.getItem("selectedSeason");
      if (!selectedSeason) throw new Error("No season selected");
      
      const response = await promoterAPI.getAll(selectedSeason);
      setPromoters(response.promoters || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch promoters");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromoters();
  }, [fetchPromoters]);

  const filteredPromoters = promoters.filter((p) => {
    const s = searchTerm.toLowerCase();
    return (
      (p.username ?? "").toLowerCase().includes(s) ||
      (p.userid ?? "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promoter Network Explorer"
        description="Directly access and view any promoter's recruitment network"
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 rounded-xl"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-destructive font-bold">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-bold py-4 px-6 uppercase text-[10px] tracking-widest">ID</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest">Name</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest">Contact</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest">Recruited By</TableHead>
                <TableHead className="text-right pr-6 uppercase text-[10px] tracking-widest">Network Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPromoters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No promoters found</TableCell>
                </TableRow>
              ) : (
                filteredPromoters.map((p) => (
                  <TableRow key={p._id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-xs px-6 py-4">{p.userid}</TableCell>
                    <TableCell className="font-bold">{p.username}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{p.mobNo}</TableCell>
                    <TableCell className="text-sm font-medium">
                      {p.recruitedBy?.promoter?.username || "Admin"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Link href={`/admin/promoters/${p._id}/network`}>
                        <Button variant="outline" className="h-9 gap-2 rounded-lg font-bold text-[11px] uppercase tracking-widest hover:bg-foreground hover:text-background transition-all">
                          <Network className="h-3.5 w-3.5" />
                          Explore Network
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

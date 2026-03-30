"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { promoterAPI, seasonAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Users, Network, UsersIcon, UserPlus } from "lucide-react";
import Link from "next/link";
import Loader from "@/components/loader";

interface NetworkData {
  promoter: any;
  network: {
    selfMadePromoters: any[];
    networkPromoters: any[];
    selfMadeCustomers: any[];
    networkCustomers: any[];
    counts: {
      selfMadePromoters: number;
      totalNetworkPromoters: number;
      selfMadeCustomers: number;
      totalNetworkCustomers: number;
    };
  };
}

export default function PromoterNetworkViewPage() {
  const params = useParams();
  const router = useRouter();
  const promoterId = params.id as string;

  const [data, setData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("all");

  const fetchNetwork = async (seasonId?: string) => {
    try {
      setLoading(true);
      const res = await promoterAPI.getNetwork(promoterId, seasonId === "all" ? undefined : seasonId);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to fetch network data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasons = async () => {
    try {
      const res = await seasonAPI.getAll();
      if (res && res.seasons) {
        setSeasons(res.seasons);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSeasons();
    fetchNetwork();
  }, [promoterId]);

  useEffect(() => {
    fetchNetwork(selectedSeason);
  }, [selectedSeason]);

  if (loading && !data) return <Loader show={true} />;

  if (error || !data) {
    return (
      <div className="space-y-6 mt-15 lg:mt-0 p-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p className="text-red-500">{error || "Data not found"}</p>
      </div>
    );
  }

  const { promoter, network } = data;

  return (
    <div className="space-y-6 relative mt-15 lg:mt-0">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/promoters" className="hover:underline">All Promoters</Link>
        <span>&gt;</span>
        <Link href={`/admin/promoters/${promoterId}`} className="hover:underline">{promoter.username}</Link>
        <span>&gt;</span>
        <span className="text-foreground font-medium">Network View</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Promoter Network</h1>
        </div>
        <div className="w-[200px]">
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              {seasons.map((s) => (
                <SelectItem key={s._id} value={s._id}>{s.name || s.seasonName || "Unnamed Season"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Promoter Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-bold">{promoter.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact</p>
              <p className="text-sm">{promoter.email}</p>
              <p className="text-sm">{promoter.mobNo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={promoter.isActive ? "default" : "destructive"}>
                {promoter.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created By</p>
              <p className="text-sm font-medium">
                {promoter.parentPromoter ? promoter.parentPromoter.username : "Root Promoter (Admin Created)"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Self-Made Promoters</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{network.counts.selfMadePromoters}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Network Promoters</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{network.counts.totalNetworkPromoters}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Self-Made Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{network.counts.selfMadeCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Network Customers</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{network.counts.totalNetworkCustomers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="promoters" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="promoters" className="py-3">Promoters Network</TabsTrigger>
          <TabsTrigger value="customers" className="py-3">Customers Network</TabsTrigger>
        </TabsList>

        <TabsContent value="promoters" className="space-y-4 pt-4">
          <Tabs defaultValue="self-made">
            <TabsList>
              <TabsTrigger value="self-made">Self-Made ({network.selfMadePromoters.length})</TabsTrigger>
              <TabsTrigger value="full-network">Full Network ({network.networkPromoters.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="self-made" className="pt-4">
              <PromoterList data={network.selfMadePromoters} showCreatedBy={false} />
            </TabsContent>
            <TabsContent value="full-network" className="pt-4">
              <PromoterList data={network.networkPromoters} showCreatedBy={true} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4 pt-4">
          <Tabs defaultValue="self-made">
            <TabsList>
              <TabsTrigger value="self-made">Self-Made ({network.selfMadeCustomers.length})</TabsTrigger>
              <TabsTrigger value="full-network">Network Customers ({network.networkCustomers.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="self-made" className="pt-4">
              <CustomerList data={network.selfMadeCustomers} showCreatedBy={false} />
            </TabsContent>
            <TabsContent value="full-network" className="pt-4">
              <CustomerList data={network.networkCustomers} showCreatedBy={true} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PromoterList({ data, showCreatedBy }: { data: any[]; showCreatedBy: boolean }) {
  if (!data || data.length === 0) return <div className="text-center p-4 text-muted-foreground">No promoters found</div>;
  return (
    <div className="border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            {showCreatedBy && <TableHead>Created By</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((p) => (
            <TableRow key={p._id}>
              <TableCell className={p.isActive ? "" : "line-through text-muted-foreground"}>{p.userid || p.username}</TableCell>
              <TableCell className={p.isActive ? "" : "text-muted-foreground"}>{p.username}</TableCell>
              <TableCell className={p.isActive ? "" : "text-muted-foreground"}>
                <div>{p.email}</div>
                <div className="text-xs">{p.mobNo}</div>
              </TableCell>
              {showCreatedBy && (
                <TableCell>
                  {p.parentPromoter ? p.parentPromoter.username : "Admin"}
                </TableCell>
              )}
              <TableCell>
                <Badge variant={p.isActive ? "default" : "destructive"}>
                  {p.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/admin/promoters/${p._id}/network`}>
                  <Button variant="outline" size="sm">View Network</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CustomerList({ data, showCreatedBy }: { data: any[]; showCreatedBy: boolean }) {
  if (!data || data.length === 0) return <div className="text-center p-4 text-muted-foreground">No customers found</div>;
  return (
    <div className="border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Card No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            {showCreatedBy && <TableHead>Created By (Promoter)</TableHead>}
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((c) => (
            <TableRow key={c._id}>
              <TableCell className="font-medium">{c.cardNo || "-"}</TableCell>
              <TableCell>{c.username}</TableCell>
              <TableCell>
                <div>{c.email}</div>
                <div className="text-xs">{c.mobNo || c.phone || ""}</div>
              </TableCell>
              {showCreatedBy && (
                <TableCell>
                  {c.promoter ? c.promoter.username : "Unknown"}
                </TableCell>
              )}
              <TableCell>
                <Badge variant={c.status === "approved" ? "default" : "secondary"}>
                  {c.status || "Pending"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

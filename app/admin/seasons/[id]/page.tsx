"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { seasonAPI, promoterAPI } from "@/lib/api";
import {
  ArrowLeft,
  Edit,
  Calendar,
  DollarSign,
  Users,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

interface Season {
  _id: string;
  Season: string;
  startDate: string;
  endDate: string;
  amount: number;
  activePromoters: string[];
  createdAt: string;
}

interface Promoter {
  _id: string;
  userid: string;
  username: string;
  email: string;
  status: string;
}

export default function SeasonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [season, setSeason] = useState<Season | null>(null);
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = params?.id as string;
    if (id) fetchSeasonDetails(id);
  }, [params?.id]);

  const fetchSeasonDetails = async (id: string) => {
    try {
      setLoading(true);

      // ✅ FIXED: promoterAPI.getAll now called with required seasonId
      const [seasonResponse, promotersResponse] = await Promise.all([
        seasonAPI.getById(id),
        promoterAPI.getAll(id),
      ]);

      setSeason(seasonResponse);

      // Filter promoters to only those active for this season
      const allPromoters = promotersResponse?.allPromoters ?? [];
      const activePromoters =
        allPromoters.filter((p: Promoter) =>
          seasonResponse.activePromoters?.includes(p._id)
        ) || [];

      setPromoters(activePromoters);
    } catch (err) {
      console.error("Failed to fetch season details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch season details"
      );
    } finally {
      setLoading(false);
    }
  };

  const getSeasonStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return "upcoming";
    if (now > end) return "completed";
    return "active";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error || !season) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{error || "Season not found"}</p>
        </div>
      </div>
    );
  }

  const status = getSeasonStatus(season.startDate, season.endDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {season.Season}
            </h1>
            <p className="text-muted-foreground">Season Details</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/seasons/${season._id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Season
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Season Information</CardTitle>
              <CardDescription>Basic details and timeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Start Date
                      </p>
                      <p className="font-medium">
                        {format(new Date(season.startDate), "MMMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">
                        {format(new Date(season.endDate), "MMMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(status)}
                    >
                      {status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Season Amount
                      </p>
                      <p className="font-medium text-lg">
                        ₹{season.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Promoters */}
          <Card>
            <CardHeader>
              <CardTitle>Active Promoters</CardTitle>
              <CardDescription>
                Promoters participating in this season
              </CardDescription>
            </CardHeader>
            <CardContent>
              {promoters.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No promoters assigned to this season
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Promoter ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoters.map((promoter) => (
                      <TableRow key={promoter._id}>
                        <TableCell className="font-medium">
                          {promoter.userid}
                        </TableCell>
                        <TableCell>{promoter.username}</TableCell>
                        <TableCell>{promoter.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              seasonResponse.activePromoters?.includes(promoter._id)
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {seasonResponse.activePromoters?.includes(promoter._id) ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Season Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Active Promoters</span>
                </div>
                <span className="font-bold text-lg">
                  {season.activePromoters?.length || 0}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Season Amount
                </span>
                <span className="font-medium">
                  ₹{season.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-medium">
                  {Math.ceil(
                    (new Date(season.endDate).getTime() -
                      new Date(season.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Users className="mr-2 h-4 w-4" />
                View Performance
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                View Earnings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

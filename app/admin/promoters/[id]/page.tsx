"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { promoterAPI } from "@/lib/api";
import {
  ArrowLeft,
  CreditCard,
  Edit,
  IndianRupeeIcon,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Customer {
  _id: string;
  username: string;
  email: string;
  cardNo: string;
}

interface Season {
  seasonId: string;
  seasonName?: string;
  statusChangedAt: string | null;
  status: "approved" | "unapproved" | "inactive";
  balance: number;
  customers: Customer[];
}

interface Payment {
  _id: string;
  accNo?: string;
  accHolderName?: string;
  bankName?: string;
  ifscCode?: string;
  branch?: string;
  branchAdress?: string;
  upiId?: string;
}

interface Promoter {
  _id: string;
  userid?: string;
  username: string;
  email: string;
  mobNo: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isActive?: boolean;
  payment?: Payment | null;
  seasons: Season[];
}

export default function PromoterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [promoter, setPromoter] = useState<Promoter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromoter = async (id: string) => {
    try {
      setLoading(true);
      const selectedSeason = localStorage.getItem("selectedseason");

      const response = await promoterAPI.getById(id, {
        seasonId: selectedSeason || undefined,
      });

      setPromoter(response.promoter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch promoter");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchPromoter(params.id as string);
    }
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "unapproved":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  if (error || !promoter) {
    return (
      <div className="space-y-6 mt-15 lg:mt-0">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p className="text-center text-red-500">
          {error || "Promoter not found"}
        </p>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold">{promoter.username}</h1>
            <p className="text-muted-foreground">
              Promoter ID: {promoter.userid || "-"}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/promoters/${promoter._id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Promoter
          </Link>
        </Button>
      </div>

      {/* Highlighted Status Change Date */}
      {promoter.seasons.length > 0 &&
        (promoter.seasons[0].statusChangedAt ? (
          <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">Last Status Update</p>
            <p className="text-xl font-bold text-red-800">
              {new Date(promoter.seasons[0].statusChangedAt).toLocaleDateString(
                "en-US",
                { year: "numeric", month: "long", day: "numeric" }
              )}
            </p>
          </div>
        ) : (
          <div className="text-center p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-lg font-semibold text-red-700">
              Status change date not available
            </p>
          </div>
        ))}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Promoter Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Promoter Information</CardTitle>
              <CardDescription>Basic details and contact info</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{promoter.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Mobile</p>
                      <p className="font-medium">{promoter.mobNo}</p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {promoter.address}, {promoter.city}, {promoter.state} -{" "}
                        {promoter.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {promoter.payment && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <p className="text-lg font-semibold">Payment Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Bank Name
                          </p>
                          <p className="font-medium">
                            {promoter.payment.bankName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Account No.
                          </p>
                          <p className="font-medium">
                            {promoter.payment.accNo}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">IFSC</p>
                        <p className="font-medium">
                          {promoter.payment.ifscCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">UPI ID</p>
                        <p className="font-medium">{promoter.payment.upiId}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Seasons */}
              <Separator />
              <div className="space-y-4">
                <p className="text-lg font-semibold">Season Details</p>
                {promoter.seasons.length > 0 ? (
                  promoter.seasons.map((s) => (
                    <div
                      key={s.seasonId}
                      className="p-3 border rounded space-y-2 bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {s.seasonName || "Season"}
                        </span>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(s.status)}
                        >
                          {s.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {s.statusChangedAt
                          ? `Status changed on: ${new Date(
                              s.statusChangedAt
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}`
                          : "Status change date not available"}
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupeeIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          Balance: ₹{s.balance.toLocaleString()}
                        </span>
                      </div>

                      {/* Customers */}
                      <div className="mt-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Customers ({s.customers.length})
                        </p>
                        {s.customers.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[50px]">S.No</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Card No.</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {s.customers.map((c, index) => (
                                <TableRow key={c._id}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell>{c.username}</TableCell>
                                  <TableCell>{c.email}</TableCell>
                                  <TableCell>{c.cardNo}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-sm text-gray-500">No customers</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No seasons found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Seasons</span>
                </div>
                <span className="font-bold text-lg">
                  {promoter.seasons.length}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Customers
                </span>
                <span className="font-medium">
                  {promoter.seasons.reduce(
                    (sum, s) => sum + (s.customers?.length || 0),
                    0
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

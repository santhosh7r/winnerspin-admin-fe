"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { promoterAPI } from "@/lib/api";
import {
   ArrowLeft,
   CreditCard,
   Edit,
   Landmark,
   Mail,
   MapPin,
   Phone,
   Network,
   UserPlus,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loader from "@/components/loader";

interface PromoterDetail {
   _id: string;
   username: string;
   userid?: string;
   email: string;
   mobNo: string;
   address?: string;
   city?: string;
   state?: string;
   pincode?: string;
   isActive?: boolean;
   parentPromoter?: { username: string };
   recruitedBy?: { type: string; promoter?: { _id: string; username: string } };
   payment?: { bankName?: string; accNo?: string; ifscCode?: string; upiId?: string };
   networkCounts?: { selfMadePromoters?: number; totalNetworkPromoters?: number; selfMadeCustomers?: number; networkCustomers?: number };
   seasons?: { seasonId: string; seasonName?: string; isActive?: boolean; balance?: number; selfMadeCustomerCount?: number; selfMadeCustomers?: { _id: string; cardNo?: string; username: string; email?: string; mobile?: string; phone?: string; status?: string }[] }[];
}

export default function PromoterDetailPage() {
   const params = useParams();
   const router = useRouter();
   const promoterId = params.id as string;

   const [promoter, setPromoter] = useState<PromoterDetail | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const fetchPromoter = useCallback(async () => {
      try {
         setLoading(true);
         const selectedSeason = localStorage.getItem("selectedSeason");
         const response = await promoterAPI.getById(promoterId, {
            seasonId: selectedSeason || undefined,
         });
         setPromoter(response.promoter);
      } catch (err) {
         setError(err instanceof Error ? err.message : "Failed to fetch promoter");
      } finally {
         setLoading(false);
      }
   }, [promoterId]);

   useEffect(() => {
      if (promoterId) {
         fetchPromoter();
      }
   }, [promoterId, fetchPromoter]);

   if (loading && !promoter) {
      return <Loader show={true} />;
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

   // Find current season info
   const selectedSeason = localStorage.getItem("selectedSeason");
   const actSeason = promoter.seasons?.find((s) => s.seasonId === selectedSeason);

   return (
      <div className="space-y-6 mt-15 lg:mt-0 relative">
         <Loader show={loading} />

         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
               <Button variant="ghost" onClick={() => router.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
               </Button>
               <div>
                  <div className="flex items-center gap-3">
                     <h1 className="text-3xl font-bold">{promoter.username}</h1>
                  </div>
                  <p className="text-muted-foreground mt-1">
                     Promoter ID: {promoter.userid || "-"}
                  </p>
               </div>
            </div>
            <div className="flex gap-2">
               <Button asChild variant="outline">
                  <Link href={`/admin/promoters/${promoter._id}/network`}>
                     <Network className="mr-2 h-4 w-4" />
                     View Network
                  </Link>
               </Button>
               <Button asChild>
                  <Link href={`/admin/promoters/${promoter._id}/edit`}>
                     <Edit className="mr-2 h-4 w-4" />
                     Edit Profile
                  </Link>
               </Button>
            </div>
         </div>

         {/* 5 Count Cards */}
         <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
               <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Self Promoters</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{promoter.networkCounts?.selfMadePromoters || 0}</div>
               </CardContent>
            </Card>
            <Card>
               <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Network Promoters</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{promoter.networkCounts?.totalNetworkPromoters || 0}</div>
               </CardContent>
            </Card>
            <Card>
               <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Self Customers</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{promoter.networkCounts?.selfMadeCustomers || 0}</div>
               </CardContent>
            </Card>
            <Card>
               <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Network Customers</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{promoter.networkCounts?.networkCustomers || 0}</div>
               </CardContent>
            </Card>
            <Card className="bg-primary text-primary-foreground border-none">
               <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium">Season Balance</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">₹{actSeason?.balance?.toLocaleString() || 0}</div>
               </CardContent>
            </Card>
         </div>

         {/* Info Card */}
         <Card>
            <CardHeader>
               <CardTitle>Promoter Information</CardTitle>
               <CardDescription>Basic details and contact info</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                           <p className="text-sm text-muted-foreground">Address</p>
                           <p className="font-medium">
                              {promoter.address}, {promoter.city}, {promoter.state} - {promoter.pincode}
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                        <div>
                           <p className="text-sm text-muted-foreground">Recruited By</p>
                           {promoter.recruitedBy?.type === "promoter" && promoter.recruitedBy.promoter ? (
                              <Link 
                                 href={`/admin/promoters/${promoter.recruitedBy.promoter._id}`}
                                 className="font-medium text-blue-700 hover:underline"
                              >
                                 {promoter.recruitedBy.promoter.username}
                              </Link>
                           ) : (
                              <p className="font-medium text-blue-700">Admin</p>
                           )}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                           <div className="flex items-center gap-3">
                              <Landmark className="h-4 w-4 text-muted-foreground" />
                              <div>
                                 <p className="text-sm text-muted-foreground">Bank Name</p>
                                 <p className="font-medium">{promoter.payment.bankName}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <div>
                                 <p className="text-sm text-muted-foreground">Account No.</p>
                                 <p className="font-medium">{promoter.payment.accNo}</p>
                              </div>
                           </div>
                           <div>
                              <p className="text-sm text-muted-foreground">IFSC</p>
                              <p className="font-medium">{promoter.payment.ifscCode}</p>
                           </div>
                           <div>
                              <p className="text-sm text-muted-foreground">UPI ID</p>
                              <p className="font-medium">{promoter.payment.upiId}</p>
                           </div>
                        </div>
                     </div>
                  </>
               )}
            </CardContent>
         </Card>

         {/* Tabs Section */}
         <Tabs defaultValue="self-customers" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
               <TabsTrigger value="self-customers" className="py-3">Self-Made Customers</TabsTrigger>
               <TabsTrigger value="network" className="py-3">Network Highlights</TabsTrigger>
               <TabsTrigger value="history" className="py-3">Season History</TabsTrigger>
            </TabsList>

            <TabsContent value="self-customers" className="pt-4 space-y-4">
               <Card>
                  <CardHeader>
                     <CardTitle>Enrolled Customers</CardTitle>
                     <CardDescription>Customers directly enrolled by this promoter in the selected season.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     {actSeason?.selfMadeCustomers && actSeason.selfMadeCustomers.length > 0 ? (
                        <Table>
                           <TableHeader>
                              <TableRow>
                                 <TableHead>Card No.</TableHead>
                                 <TableHead>Username</TableHead>
                                 <TableHead>Email</TableHead>
                                 <TableHead>Mobile</TableHead>
                                 <TableHead>Status</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {actSeason.selfMadeCustomers.map((c) => (
                                 <TableRow key={c._id}>
                                    <TableCell className="font-medium">{c.cardNo || "-"}</TableCell>
                                    <TableCell>{c.username}</TableCell>
                                    <TableCell>{c.email}</TableCell>
                                    <TableCell>{c.mobile || c.phone}</TableCell>
                                    <TableCell>{c.status}</TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     ) : (
                        <p className="text-center text-muted-foreground p-8">No customers enrolled in this season.</p>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="network" className="pt-4 space-y-4">
               <Card>
                  <CardContent className="pt-6 text-center">
                     <Network className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                     <h3 className="text-xl font-bold mb-2">Network View</h3>
                     <p className="text-muted-foreground mb-4">View the expanded network structure of this promoter including sub-promoters and their customers.</p>
                     <Button asChild>
                        <Link href={`/admin/promoters/${promoter._id}/network`}>
                           Open Full Network View
                        </Link>
                     </Button>
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="history" className="pt-4 space-y-4">
               <Card>
                  <CardHeader>
                     <CardTitle>Season History</CardTitle>
                     <CardDescription>Performance across all seasons.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     {promoter.seasons && promoter.seasons.length > 0 ? (
                        <Table>
                           <TableHeader>
                              <TableRow>
                                 <TableHead>Season Name</TableHead>
                                 <TableHead>Self Enrolled</TableHead>
                                 <TableHead className="text-right">Balance</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {promoter.seasons.map((s) => (
                                 <TableRow key={s.seasonId}>
                                    <TableCell className="font-medium">{s.seasonName}</TableCell>
                                    <TableCell>{s.selfMadeCustomerCount || s.selfMadeCustomers?.length || 0}</TableCell>
                                    <TableCell className="text-right font-medium">₹{s.balance?.toLocaleString() || 0}</TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     ) : (
                        <p className="text-center text-muted-foreground p-8">No season history available.</p>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>
         </Tabs>
      </div>
   );
}

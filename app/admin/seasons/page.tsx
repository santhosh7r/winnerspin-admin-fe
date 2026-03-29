// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { seasonAPI } from "@/lib/api";
// import { Plus, Calendar, Play, Clock, CheckCircle } from "lucide-react";
// import Loader from "@/components/loader"; // ✅ using your global loader
// import { CreateSeasonDialog } from "./create-season-dialog";

// interface SeasonItem {
//   _id: string;
//   season: string;
//   startDate: string;
//   endDate: string;
//   amount?: string | number;
//   totalInstallment?: string | number;
//   approvedPromoters?: string[];
//   createdAt?: string;
//   updatedAt?: string;
//   __v?: number;
// }

// interface GetAllResponse {
//   message?: string;
//   seasons?: SeasonItem[];
//   curSeason?: SeasonItem | null;
// }

// export default function SeasonsPage() {
//   const [seasons, setSeasons] = useState<SeasonItem[]>([]);
//   const [curSeason, setCurSeason] = useState<SeasonItem | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [deleteSeason, setDeleteSeason] = useState<SeasonItem | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);

//   useEffect(() => {
//     fetchSeasons();
//   }, []);

//   const fetchSeasons = async () => {
//     try {
//       setLoading(true);
//       const response = (await seasonAPI.getAll()) as GetAllResponse;
//       setSeasons(response.seasons || []);
//       setCurSeason(response.curSeason || null);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch seasons");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (seasonId: string) => {
//     try {
//       setIsDeleting(true);
//       setLoading(true);
//       await seasonAPI.delete(seasonId);
//       setSeasons((prev) => prev.filter((s) => s._id !== seasonId));
//       if (curSeason?._id === seasonId) setCurSeason(null);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to delete season");
//     } finally {
//       setIsDeleting(false);
//       setLoading(false);
//       setDeleteSeason(null);
//     }
//   };

//   const getSeasonStatus = (startDate?: string, endDate?: string) => {
//     if (!startDate || !endDate) return "unknown";
//     const now = new Date();
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     if (now < start) return "upcoming";
//     if (now > end) return "completed";
//     return "active";
//   };

//   const stats = {
//     total: seasons.length,
//     active: seasons.filter(
//       (s) => getSeasonStatus(s.startDate, s.endDate) === "active"
//     ).length,
//     upcoming: seasons.filter(
//       (s) => getSeasonStatus(s.startDate, s.endDate) === "upcoming"
//     ).length,
//     completed: seasons.filter(
//       (s) => getSeasonStatus(s.startDate, s.endDate) === "completed"
//     ).length,
//   };

//   const formatDate = (d?: string) =>
//     d ? new Date(d).toLocaleDateString() : "-";

//   return (
//     <div className="space-y-6 relative mt-15 lg:mt-0">
//       {/* ✅ Global Loader Overlay */}
//       <Loader show={loading} />

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">
//             Winnerspin Seasons
//           </h1>
//           <p className="text-muted-foreground">
//             Manage promotional seasons and promoter assignments
//           </p>
//         </div>
//         <CreateSeasonDialog onSuccess={fetchSeasons} />
//       </div>

//       {/* Current Season */}
//       {curSeason && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Current Season</CardTitle>
//             <CardDescription>{curSeason.season}</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
//               <div>
//                 <div className="text-xs text-muted-foreground">Start</div>
//                 <div className="font-semibold">
//                   {formatDate(curSeason.startDate)}
//                 </div>
//               </div>
//               <div>
//                 <div className="text-xs text-muted-foreground">End</div>
//                 <div className="font-semibold">
//                   {formatDate(curSeason.endDate)}
//                 </div>
//               </div>
//               <div>
//                 <div className="text-xs text-muted-foreground">Amount</div>
//                 <div className="font-semibold">{curSeason.amount ?? "-"}</div>
//               </div>
//               <div>
//                 <div className="text-xs text-muted-foreground">
//                   Approved Promoters
//                 </div>
//                 <div className="font-semibold">
//                   {(curSeason.approvedPromoters || []).length}
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         {[
//           {
//             title: "Total Seasons",
//             icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
//             value: stats.total,
//           },
//           {
//             title: "Active",
//             icon: <Play className="h-4 w-4 text-green-600" />,
//             value: stats.active,
//             color: "text-green-600",
//           },
//           {
//             title: "Upcoming",
//             icon: <Clock className="h-4 w-4 text-blue-600" />,
//             value: stats.upcoming,
//             color: "text-blue-600",
//           },
//           {
//             title: "Completed",
//             icon: <CheckCircle className="h-4 w-4 text-gray-600" />,
//             value: stats.completed,
//             color: "text-gray-600",
//           },
//         ].map((stat) => (
//           <Card key={stat.title}>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">
//                 {stat.title}
//               </CardTitle>
//               {stat.icon}
//             </CardHeader>
//             <CardContent>
//               <div className={`text-2xl font-bold ${stat.color || ""}`}>
//                 {stat.value}
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>All Seasons</CardTitle>
//           <CardDescription>
//             View and manage all promotional seasons
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <table className="w-full table-auto">
//               <thead>
//                 <tr className="text-left text-sm text-muted-foreground">
//                   <th className="px-2 py-2">Season</th>
//                   <th className="px-2 py-2">Start</th>
//                   <th className="px-2 py-2">End</th>
//                   <th className="px-2 py-2">Amount</th>
//                   <th className="px-2 py-2">Installments</th>
//                   <th className="px-2 py-2">Promoters</th>
//                   <th className="px-2 py-2">Status</th>
//                   <th className="px-2 py-2">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {seasons.map((s) => (
//                   <tr key={s._id} className="border-t">
//                     <td className="px-2 py-3">{s.season}</td>
//                     <td className="px-2 py-3">{formatDate(s.startDate)}</td>
//                     <td className="px-2 py-3">{formatDate(s.endDate)}</td>
//                     <td className="px-2 py-3">{s.amount ?? "-"}</td>
//                     <td className="px-2 py-3">{s.totalInstallment ?? "-"}</td>
//                     <td className="px-2 py-3">
//                       {(s.approvedPromoters || []).length}
//                     </td>
//                     <td className="px-2 py-3">
//                       {getSeasonStatus(s.startDate, s.endDate)}
//                     </td>
//                     <td className="px-2 py-3">
//                       <button
//                         onClick={() => setDeleteSeason(s)}
//                         className="text-destructive hover:underline"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}

//                 {seasons.length === 0 && !loading && (
//                   <tr>
//                     <td
//                       colSpan={8}
//                       className="px-2 py-4 text-center text-muted-foreground"
//                     >
//                       No seasons available
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Error */}
//       {error && (
//         <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg">
//           {error}
//         </div>
//       )}

//       {/* Confirmation Dialog */}
//       <AlertDialog
//         open={!!deleteSeason}
//         onOpenChange={() => setDeleteSeason(null)}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Season</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete the season “{deleteSeason?.season}
//               ”? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() => handleDelete(deleteSeason!._id)}
//               disabled={isDeleting}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               {isDeleting ? "Deleting..." : "Delete"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

"use client";

import Loader from "@/components/loader";
import { PageHeader } from "@/components/page-header";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { seasonAPI } from "@/lib/api";
import { Calendar, CheckCircle, Clock, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateSeasonDialog } from "./create-season-dialog";

interface SeasonItem {
  _id: string;
  season: string;
  startDate: string;
  endDate: string;
  amount?: string | number;
  totalInstallment?: string | number;
  activePromoters?: string[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface GetAllResponse {
  message?: string;
  seasons?: SeasonItem[];
  curSeason?: SeasonItem | null;
}

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<SeasonItem[]>([]);
  const [curSeason, setCurSeason] = useState<SeasonItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteSeason, setDeleteSeason] = useState<SeasonItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const response = (await seasonAPI.getAll()) as GetAllResponse;
      setSeasons(response.seasons || []);
      setCurSeason(response.curSeason || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch seasons");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (seasonId: string) => {
    try {
      setIsDeleting(true);
      setLoading(true);

      await seasonAPI.delete(seasonId);

      setSeasons((prev) => prev.filter((s) => s._id !== seasonId));

      if (curSeason?._id === seasonId) {
        setCurSeason(null);
      }

      // ✅ CLEAR LOCAL STORAGE SEASON ID
      const stored = localStorage.getItem("selectedSeason");
      if (stored === seasonId) {
        localStorage.removeItem("selectedSeason");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete season");
    } finally {
      setIsDeleting(false);
      setLoading(false);
      setDeleteSeason(null);
    }
  };

  const getSeasonStatus = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return "unknown";
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return "upcoming";
    if (now > end) return "completed";
    return "active";
  };

  const stats = {
    total: seasons.length,
    active: seasons.filter(
      (s) => getSeasonStatus(s.startDate, s.endDate) === "active"
    ).length,
    upcoming: seasons.filter(
      (s) => getSeasonStatus(s.startDate, s.endDate) === "upcoming"
    ).length,
    completed: seasons.filter(
      (s) => getSeasonStatus(s.startDate, s.endDate) === "completed"
    ).length,
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString() : "-";

  return (
    <div className="space-y-6">
      <Loader show={loading} />

      <PageHeader
        title="Seasons"
        description="Manage promotional seasons and promoter assignments"
        actions={<CreateSeasonDialog onSuccess={fetchSeasons} />}
      />

      {curSeason && (
        <Card>
          <CardHeader>
            <CardTitle>Current Season</CardTitle>
            <CardDescription>{curSeason.season}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Start</div>
                <div className="font-semibold">
                  {formatDate(curSeason.startDate)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">End</div>
                <div className="font-semibold">
                  {formatDate(curSeason.endDate)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Amount</div>
                <div className="font-semibold">{curSeason.amount ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Active Promoters
                </div>
                <div className="font-semibold">
                  {(curSeason.activePromoters || []).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: "Total Seasons",
            icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
            value: stats.total,
          },
          {
            title: "Active",
            icon: <Play className="h-4 w-4 text-green-600" />,
            value: stats.active,
            color: "text-green-600",
          },
          {
            title: "Upcoming",
            icon: <Clock className="h-4 w-4 text-blue-600" />,
            value: stats.upcoming,
            color: "text-blue-600",
          },
          {
            title: "Completed",
            icon: <CheckCircle className="h-4 w-4 text-gray-600" />,
            value: stats.completed,
            color: "text-gray-600",
          },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color || ""}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Seasons</CardTitle>
          <CardDescription>
            View and manage all promotional seasons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="px-2 py-2">Season</th>
                  <th className="px-2 py-2">Start</th>
                  <th className="px-2 py-2">End</th>
                  <th className="px-2 py-2">Amount</th>
                  <th className="px-2 py-2">Installments</th>
                  <th className="px-2 py-2">Promoters</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {seasons.map((s) => (
                  <tr key={s._id} className="border-t">
                    <td className="px-2 py-3">{s.season}</td>
                    <td className="px-2 py-3">{formatDate(s.startDate)}</td>
                    <td className="px-2 py-3">{formatDate(s.endDate)}</td>
                    <td className="px-2 py-3">{s.amount ?? "-"}</td>
                    <td className="px-2 py-3">{s.totalInstallment ?? "-"}</td>
                    <td className="px-2 py-3">
                      {(s.activePromoters || []).length}
                    </td>
                    <td className="px-2 py-3">
                      {getSeasonStatus(s.startDate, s.endDate)}
                    </td>
                    <td className="px-2 py-3">
                      <button
                        onClick={() => setDeleteSeason(s)}
                        className="text-destructive hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {seasons.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-2 py-4 text-center text-muted-foreground"
                    >
                      No seasons available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <AlertDialog
        open={!!deleteSeason}
        onOpenChange={() => setDeleteSeason(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Season</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the season “{deleteSeason?.season}
              ”? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteSeason!._id)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

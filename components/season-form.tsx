// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { PromoterSelector, Promoter } from "./promoter-selector";
// import { seasonAPI } from "@/lib/api"; // ✅ only seasonAPI now
// import { Loader2, Calendar } from "lucide-react";

// interface SeasonFormData {
//   Season: string;
//   startDate: string;
//   endDate: string;
//   amount: number;
//   promotersCommission: number;
//   promotersRepaymentCommission: number;
//   approvedPromoters: string[];
// }

// interface SeasonFormProps {
//   initialData?: Partial<SeasonFormData>;
//   onSubmit: (data: SeasonFormData) => Promise<void>;
//   isEditing?: boolean;
// }

// export function SeasonForm({
//   initialData,
//   onSubmit,
//   isEditing = false,
// }: SeasonFormProps) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [promotersLoading, setPromotersLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [previousSeasonPromoters, setPreviousSeasonPromoters] = useState<
//     Promoter[]
//   >([]);

//   const [formData, setFormData] = useState<SeasonFormData>({
//     Season: initialData?.Season || "",
//     startDate: initialData?.startDate || "",
//     endDate: initialData?.endDate || "",
//     amount: initialData?.amount || 0,
//     promotersCommission: initialData?.promotersCommission || 0,
//     promotersRepaymentCommission:
//       initialData?.promotersRepaymentCommission || 0,
//     approvedPromoters: initialData?.approvedPromoters || [],
//   });

//   useEffect(() => {
//     if (!isEditing) {
//       fetchPreviousSeasonPromoters();
//     }
//   }, [isEditing]);

//   const fetchPreviousSeasonPromoters = async () => {
//     try {
//       const response = await seasonAPI.getPreviousPromoters();
//       const merged = [
//         ...(response.approved || []),
//         ...(response.nonApproved || []),
//       ];
//       setPreviousSeasonPromoters(merged);

//       setFormData((prev) => ({
//         ...prev,
//         approvedPromoters: response.approved.map((p: Promoter) => p._id),
//       }));
//     } catch (err) {
//       console.error("Failed to fetch previous season data:", err);
//       setError("Failed to fetch previous season promoters");
//     } finally {
//       setPromotersLoading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       await onSubmit(formData);
//       router.push("/admin/seasons");
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (
//     field: keyof SeasonFormData,
//     value: string | number | string[]
//   ) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   return (
//     <div className="space-y-6">
//       <Card className="max-w-2xl mx-auto">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Calendar className="h-5 w-5" />
//             {isEditing ? "Edit Season" : "Create New Season"}
//           </CardTitle>
//           <CardDescription>
//             {isEditing
//               ? "Update season information and promoter selection"
//               : "Set up a new promotional season"}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="season">Season Name</Label>
//               <Input
//                 id="season"
//                 value={formData.Season}
//                 onChange={(e) => handleChange("Season", e.target.value)}
//                 placeholder="Summer 2025"
//                 required
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="startDate">Start Date</Label>
//                 <Input
//                   id="startDate"
//                   type="date"
//                   value={formData.startDate}
//                   onChange={(e) => handleChange("startDate", e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="endDate">End Date</Label>
//                 <Input
//                   id="endDate"
//                   type="date"
//                   value={formData.endDate}
//                   onChange={(e) => handleChange("endDate", e.target.value)}
//                   required
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="amount">Season Amount (₹)</Label>
//               <Input
//                 id="amount"
//                 type="number"
//                 value={formData.amount || ""}
//                 onChange={(e) =>
//                   handleChange("amount", Number.parseFloat(e.target.value) || 0)
//                 }
//                 placeholder="Example: 1000"
//                 required
//                 min="0"
//                 step="0.01"
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="promotersCommission">
//                   Promoter Commission (₹)
//                 </Label>
//                 <Input
//                   id="promotersCommission"
//                   type="number"
//                   value={formData.promotersCommission || ""}
//                   onChange={(e) =>
//                     handleChange(
//                       "promotersCommission",
//                       Number.parseFloat(e.target.value) || 0
//                     )
//                   }
//                   placeholder="Example: 400"
//                   required
//                   min="0"
//                   step="0.01"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="promotersRepaymentCommission">
//                   Promoter Repayment Commission (₹)
//                 </Label>
//                 <Input
//                   id="promotersRepaymentCommission"
//                   type="number"
//                   value={formData.promotersRepaymentCommission || ""}
//                   onChange={(e) =>
//                     handleChange(
//                       "promotersRepaymentCommission",
//                       Number.parseFloat(e.target.value) || 0
//                     )
//                   }
//                   placeholder="Example: 50"
//                   required
//                   min="0"
//                   step="0.01"
//                 />
//               </div>
//             </div>

//             {error && (
//               <Alert variant="destructive">
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             <div className="flex gap-4 pt-4">
//               <Button type="submit" disabled={loading}>
//                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 {isEditing ? "Update Season" : "Create Season"}
//               </Button>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => router.back()}
//               >
//                 Cancel
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>

//       {!promotersLoading && (
//         <PromoterSelector
//           promoters={previousSeasonPromoters}
//           selectedPromoters={formData.approvedPromoters}
//           onSelectionChange={(selected) =>
//             handleChange("approvedPromoters", selected)
//           }
//         />
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PromoterSelector, Promoter } from "./promoter-selector";
import { seasonAPI } from "@/lib/api";
import { Loader2, Calendar } from "lucide-react";

// ✅ Exported so it can be imported in page.tsx
export interface SeasonFormData {
  Season: string;
  startDate: string;
  endDate: string;
  amount: number;
  promotersCommission: number;
  promotersRepaymentCommission: number;
  approvedPromoters: string[];
}

interface SeasonFormProps {
  initialData?: Partial<SeasonFormData>;
  onSubmit: (data: SeasonFormData) => Promise<any>;
  isEditing?: boolean;
  hidePromoters?: boolean;
}

export function SeasonForm({
  initialData,
  onSubmit,
  isEditing = false,
  hidePromoters = false,
}: SeasonFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [promotersLoading, setPromotersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousSeasonPromoters, setPreviousSeasonPromoters] = useState<
    Promoter[]
  >([]);

  const [formData, setFormData] = useState<SeasonFormData>({
    Season: initialData?.Season || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    amount: initialData?.amount || 0,
    promotersCommission: initialData?.promotersCommission || 0,
    promotersRepaymentCommission:
      initialData?.promotersRepaymentCommission || 0,
    approvedPromoters: initialData?.approvedPromoters || [],
  });

  useEffect(() => {
    if (!isEditing) {
      fetchPreviousSeasonPromoters();
    }
  }, [isEditing]);

  const fetchPreviousSeasonPromoters = async () => {
    try {
      const response = await seasonAPI.getPreviousPromoters();
      const merged = [
        ...(response.approved || []),
        ...(response.nonApproved || []),
      ];
      setPreviousSeasonPromoters(merged);

      setFormData((prev) => ({
        ...prev,
        approvedPromoters: response.approved.map((p: Promoter) => p._id),
      }));
    } catch (err) {
      console.error("Failed to fetch previous season data:", err);
      setError("Failed to fetch previous season promoters");
    } finally {
      setPromotersLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await onSubmit(formData);
      if (res && res.stay) {
        // do not redirect, handled by parent
      } else {
        router.push("/admin/seasons");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof SeasonFormData,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isEditing ? "Edit Season" : "Create New Season"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update season information and promoter selection"
              : "Set up a new promotional season"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="season">Season Name</Label>
              <Input
                id="season"
                value={formData.Season}
                onChange={(e) => handleChange("Season", e.target.value)}
                placeholder="Summer 2025"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Season Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount || ""}
                onChange={(e) =>
                  handleChange("amount", Number.parseFloat(e.target.value) || 0)
                }
                placeholder="Example: 1000"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="promotersCommission">
                  Promoter Commission (₹)
                </Label>
                <Input
                  id="promotersCommission"
                  type="number"
                  value={formData.promotersCommission || ""}
                  onChange={(e) =>
                    handleChange(
                      "promotersCommission",
                      Number.parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="Example: 400"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotersRepaymentCommission">
                  Promoter Repayment Commission (₹)
                </Label>
                <Input
                  id="promotersRepaymentCommission"
                  type="number"
                  value={formData.promotersRepaymentCommission || ""}
                  onChange={(e) =>
                    handleChange(
                      "promotersRepaymentCommission",
                      Number.parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="Example: 50"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Season" : "Create Season"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {!hidePromoters && !promotersLoading && (
        <PromoterSelector
          promoters={previousSeasonPromoters}
          selectedPromoters={formData.approvedPromoters}
          onSelectionChange={(selected) =>
            handleChange("approvedPromoters", selected)
          }
        />
      )}
    </div>
  );
}

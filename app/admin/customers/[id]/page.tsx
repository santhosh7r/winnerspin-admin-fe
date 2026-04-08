
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { customerAPI, seasonAPI } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Edit2,
  Package,
  Loader2,
} from "lucide-react";

interface Installment {
  _id: string;
  installmentNo: number;
  amount: string;
  paymentDate: string;
}

interface Customer {
  _id: string;
  username: string;
  email: string;
  mobile: string;
  cardNo?: string;
  state: string;
  city: string;
  address: string;
  pincode: number;
  firstPayment: string;
  status: "pending" | "approved" | "rejected";
  promoterName?: string;
  seasonNames?: string;
  seasonId?: string;
  productDetails?: string;
  createdAt: string;
  approvedAt?: string;
  installments?: Installment[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productDetailsText, setProductDetailsText] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    if (params.id) {
       fetchCustomer(params.id as string);
       fetchSeasonStatus();
    }
  }, [params.id]);

  const fetchSeasonStatus = async () => {
    try {
      const seasonId = typeof window !== "undefined" ? localStorage.getItem("selectedSeason") : null;
      if (!seasonId) return;
      const seasonRes = (await seasonAPI.getById(seasonId)) as unknown as { season?: { endDate?: string }; endDate?: string };
      const endDate = seasonRes?.season?.endDate || seasonRes?.endDate;
      if (endDate) {
        setIsReadOnly(new Date(endDate) < new Date());
      }
    } catch (err) {
      console.error("Failed to fetch season status", err);
    }
  };

  const fetchCustomer = async (id: string) => {
    try {
      setLoading(true);
      const response = await customerAPI.getById(id);
      setCustomer(response.customer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch customer");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!customer) return;
    try {
      setSavingDetails(true);
      await customerAPI.updateProductDetails(customer._id, productDetailsText);
      setCustomer((prev) => prev ? { ...prev, productDetails: productDetailsText } : prev);
      setIsEditModalOpen(false);
    } catch (err) {
       alert(err instanceof Error ? err.message : "Failed to update product details");
    } finally {
      setSavingDetails(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error || !customer)
    return (
      <div className="p-6 text-center">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p>{error || "Customer not found"}</p>
      </div>
    );

  return (
    <div className="space-y-6 p-4 mt-15 lg:mt-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{customer.username}</h1>
          <p className="text-muted-foreground">Customer Details</p>
        </div>
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{customer.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mobile</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{customer.mobile}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card Number</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{customer.cardNo || "Not provided"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {customer.address}, {customer.city}, {customer.state} -{" "}
              {customer.pincode}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(customer.status)}>
              {customer.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>First Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p>₹{customer.firstPayment}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Promoter</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{customer.promoterName || "Not assigned"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Season</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.seasonNames ? (
              <Badge variant="outline" className="text-sm font-medium">
                Season: {customer.seasonNames}
              </Badge>
            ) : (
              <p className="text-muted-foreground">Not assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{new Date(customer.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>

        {/* Product Details Card */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Details
            </CardTitle>
            {!isReadOnly && customer.status === "approved" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setProductDetailsText(customer.productDetails || "");
                  setIsEditModalOpen(true);
                }}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 p-4 rounded-xl min-h-[100px] border border-border">
              {customer.productDetails ? (
                <p className="whitespace-pre-wrap">{customer.productDetails}</p>
              ) : (
                <p className="text-muted-foreground italic">No product details have been added yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Installments */}
      {customer.installments && customer.installments.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-6">Installments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customer.installments.map((inst) => (
              <Card key={inst._id}>
                <CardHeader>
                  <CardTitle>Installment #{inst.installmentNo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Amount: ₹{inst.amount}</p>
                  <p>
                    Payment Date:{" "}
                    {new Date(inst.paymentDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product Details</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={productDetailsText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProductDetailsText(e.target.value)}
              placeholder="Enter product details (e.g., Size: XL, Color: Blue)..."
              className="min-h-[150px] resize-y"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={savingDetails}>
              Cancel
            </Button>
            <Button onClick={handleSaveDetails} disabled={savingDetails} className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black font-bold">
              {savingDetails && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

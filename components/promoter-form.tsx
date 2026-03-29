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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// ✅ Fixed: userid is optional
export interface PromoterFormData {
  userid?: string;
  username: string;
  email: string;
  mobNo: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status?: "approved" | "unapproved";
}

interface PromoterFormProps {
  initialData?: Partial<PromoterFormData>;
  onSubmit: (data: PromoterFormData) => Promise<void>;
  isEditing?: boolean;
}

export function PromoterForm({
  initialData = {},
  onSubmit,
  isEditing = false,
}: PromoterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PromoterFormData>({
    userid: initialData.userid || "",
    username: initialData.username || "",
    email: initialData.email || "",
    mobNo: initialData.mobNo || "",
    address: initialData.address || "",
    city: initialData.city || "",
    state: initialData.state || "",
    pincode: initialData.pincode || "",
    status: initialData.status || "unapproved",
  });

  // Auto-fill city & state from pincode
  useEffect(() => {
    const fetchPincodeData = async () => {
      if (formData.pincode.length === 6) {
        try {
          const response = await fetch(
            `https://api.postalpincode.in/pincode/${formData.pincode}`
          );
          const data = await response.json();

          if (data?.[0]?.Status === "Success" && data[0]?.PostOffice?.length) {
            const { District, State } = data[0].PostOffice[0];
            setFormError(null);
            setFormData((prev) => ({
              ...prev,
              city: District || "",
              state: State || "",
            }));
          } else {
            setFormError("Invalid pincode.");
            setFormData((prev) => ({ ...prev, city: "", state: "" }));
          }
        } catch {
          setFormError("Failed to fetch pincode data.");
        }
      }
    };
    fetchPincodeData();
  }, [formData.pincode]);

  const handleChange = <K extends keyof PromoterFormData>(
    field: K,
    value: PromoterFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.username.trim()) return "Username is required.";
    if (!formData.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return "Invalid email format.";
    if (!/^\d{10}$/.test(formData.mobNo))
      return "Mobile number must be exactly 10 digits.";
    if (!/^\d{6}$/.test(formData.pincode))
      return "Pincode must be exactly 6 digits.";
    if (!formData.address.trim()) return "Address is required.";
    if (!formData.city.trim()) return "City is required.";
    if (!formData.state.trim()) return "State is required.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isEditing) {
      const err = validateForm();
      if (err) return setFormError(err);
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      router.push("/admin/promoters");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Promoter" : "Create New Promoter"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Update promoter details"
            : "Add a new promoter to the system"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="userid">Promoter ID</Label>
              <Input id="userid" value={formData.userid} disabled />
            </div>
          )}

          {/* Username + Email */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username *</Label>
              <Input
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                required={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required={!isEditing}
              />
            </div>
          </div>

          {/* Mobile + Pincode */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mobile Number *</Label>
              <Input
                value={formData.mobNo}
                onChange={(e) =>
                  handleChange("mobNo", e.target.value.replace(/\D/g, ""))
                }
                maxLength={10}
                required={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Pincode *</Label>
              <Input
                value={formData.pincode}
                onChange={(e) => handleChange("pincode", e.target.value)}
                maxLength={6}
                required={!isEditing}
              />
            </div>
          </div>

          {/* Address + City + State */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Address *</Label>
              <Input
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                required={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>City *</Label>
              <Input
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                required={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>State *</Label>
              <Input
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                required={!isEditing}
              />
            </div>
          </div>

          {/* Status + Active */}
          {isEditing && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status for this Season *</Label>
                <Select
                  value={formData.status || "unapproved"}
                  onValueChange={(value: "approved" | "unapproved") =>
                    handleChange("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="unapproved">Unapproved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Promoter" : "Create Promoter"}
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
  );
}

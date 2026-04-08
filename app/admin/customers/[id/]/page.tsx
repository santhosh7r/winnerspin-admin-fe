"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { customerAPI } from "@/lib/api";
import {
  User,
  Mail,
  Smartphone,
  CreditCard,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import Loader from "@/components/loader";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

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
  createdAt: string;
  approvedAt?: string;
  installments?: Installment[];
}

function InfoCard({ label, value, icon: Icon, colorClass }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-all group active:scale-95">
      <div className={cn("h-11 w-11 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-base font-bold text-foreground">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) fetchCustomer(params.id as string);
  }, [params.id]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold border-none px-4 py-1 rounded-full uppercase text-[10px] tracking-widest">Approved</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-bold border-none px-4 py-1 rounded-full uppercase text-[10px] tracking-widest">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 font-bold border-none px-4 py-1 rounded-full uppercase text-[10px] tracking-widest">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 font-bold border-none px-4 py-1 rounded-full uppercase text-[10px] tracking-widest">{status}</Badge>;
    }
  };

  if (loading) return <Loader show={true} />;
  
  if (error || !customer)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
         <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
            <User className="h-10 w-10 text-muted-foreground/30" />
         </div>
         <h2 className="text-2xl font-bold text-foreground mb-2">Customer Not Found</h2>
         <p className="text-muted-foreground mb-8 max-w-sm mx-auto">{error || "The customer you are looking for does not exist or has been removed."}</p>
         <button onClick={() => router.back()} className="px-8 h-12 bg-foreground text-background font-bold rounded-xl uppercase text-[11px] tracking-widest hover:opacity-90 transition-opacity">Go Back</button>
      </div>
    );

  return (
    <div className="space-y-8 relative mt-15 lg:mt-0 pb-12">
      <PageHeader 
        title={customer.username}
        description="Detailed customer profile and financial history"
        showBack={true}
        actions={getStatusBadge(customer.status)}
      />

      {/* Profile Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <InfoCard label="Email Address" value={customer.email} icon={Mail} colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" />
        <InfoCard label="Mobile Number" value={customer.mobile} icon={Smartphone} colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" />
        <InfoCard label="Card Number" value={customer.cardNo || "NOT ISSUED"} icon={CreditCard} colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" />
        <InfoCard label="Registration" value={new Date(customer.createdAt).toLocaleDateString()} icon={Calendar} colorClass="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400" />
        
        <div className="lg:col-span-2">
           <InfoCard label="Full Address" value={`${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}`} icon={MapPin} colorClass="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" />
        </div>
        
        <InfoCard label="1st Installment" value={`₹${Number(customer.firstPayment).toLocaleString()}`} icon={DollarSign} colorClass="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" />
        <InfoCard label="Assigned Promoter" value={customer.promoterName || "DIRECT"} icon={ShieldCheck} colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" />
      </div>

      {/* Financial Details / Installments Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="h-8 w-1 bg-foreground rounded-full" />
           <h2 className="text-[20px] font-bold tracking-tight">Repayment History</h2>
        </div>

        {!customer.installments || customer.installments.length === 0 ? (
          <Card className="border-dashed border-2 bg-muted/20">
            <CardContent className="py-20 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground font-bold uppercase text-[11px] tracking-widest">No installments recorded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {customer.installments.map((inst) => (
              <Card key={inst._id} className="group hover:border-foreground/20 transition-all shadow-sm overflow-hidden">
                <div className="h-1 bg-foreground transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                       <span className="h-2 w-2 bg-emerald-500 rounded-full" />
                       Installment #{inst.installmentNo}
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-foreground tracking-tighter">₹{Number(inst.amount).toLocaleString()}</p>
                    <div className="flex items-center gap-2 text-muted-foreground font-semibold text-xs mt-2 p-2 bg-muted/50 rounded-lg">
                       <Calendar className="h-3 w-3" />
                       {new Date(inst.paymentDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

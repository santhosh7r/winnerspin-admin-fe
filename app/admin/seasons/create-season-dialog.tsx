"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { seasonAPI } from "@/lib/api";
import { Loader2, Plus, Calendar, Users, Search, UserCheck } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface CreateSeasonDialogProps {
  onSuccess: () => void;
}

interface PromoterEntry {
  _id: string;
  username: string;
  userid?: string;
  email?: string;
  mobNo?: string;
  status?: string;
  wasActiveLastSeason?: boolean;
}

export function CreateSeasonDialog({ onSuccess }: CreateSeasonDialogProps) {
  const [open, setOpen] = useState(false);
  const [promoters, setPromoters] = useState<PromoterEntry[]>([]);
  const [activePromoters, setActivePromoters] = useState<Set<string>>(new Set());
  const [loadingPromoters, setLoadingPromoters] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyApproved, setShowOnlyApproved] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    Season: "",
    startDate: "",
    endDate: "",
    amount: 0,
    promotersCommission: 0,
    promotersRepaymentCommission: 0,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        Season: "",
        startDate: "",
        endDate: "",
        amount: 0,
        promotersCommission: 0,
        promotersRepaymentCommission: 0,
      });
      setErrorStatus(null);
      setSearchTerm("");
      setShowOnlyApproved(true);
      fetchPromoters();
    }
  }, [open]);

  const fetchPromoters = async () => {
    try {
      setLoadingPromoters(true);
      setErrorStatus(null);
      const seasonsRes = await seasonAPI.getAll() as { curSeason?: { _id: string }; seasons?: { _id: string }[] };
      const latestSeasonId = seasonsRes.curSeason?._id || seasonsRes.seasons?.[0]?._id;
      
      const pRes = await seasonAPI.getPromotersForNewSeason(latestSeasonId) as { promoters?: PromoterEntry[] };
      const promotersList = pRes.promoters || [];
      setPromoters(promotersList);
      
      // Default pre-selection
      const preselected: string[] = promotersList
        .filter((p: PromoterEntry) => p.status === "approved" || p.wasActiveLastSeason)
        .map((p: PromoterEntry) => p._id);
        
      setActivePromoters(new Set(preselected));
    } catch (err) {
      console.error(err);
      setErrorStatus("Failed to fetch previous season promoters");
    } finally {
      setLoadingPromoters(false);
    }
  };

  const filteredPromoters = useMemo(() => {
    let result = promoters;
    if (showOnlyApproved) {
      result = result.filter(p => p.status === "approved" || p.wasActiveLastSeason);
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(p => 
        (p.username || "").toLowerCase().includes(s) || 
        (p.userid || "").toLowerCase().includes(s) ||
        (p.mobNo || "").toLowerCase().includes(s)
      );
    }
    return result;
  }, [promoters, searchTerm, showOnlyApproved]);

  const togglePromoter = (id: string, checked: boolean) => {
    setActivePromoters(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      const currentIds = filteredPromoters.map(p => p._id);
      setActivePromoters(prev => {
        const next = new Set(prev);
        currentIds.forEach(id => next.add(id));
        return next;
      });
    } else {
      const currentIds = filteredPromoters.map(p => p._id);
      setActivePromoters(prev => {
        const next = new Set(prev);
        currentIds.forEach(id => next.delete(id));
        return next;
      });
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Season || !formData.startDate || !formData.endDate) return;
    
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        promoterIds: Array.from(activePromoters) 
      };
      await seasonAPI.create(payload);
      setOpen(false);
      onSuccess();
    } catch {
      setErrorStatus("Failed to create season. Please check your network and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Season
        </Button>
      </DialogTrigger>

      <DialogContent className="!w-screen !h-[100dvh] !max-w-none sm:!max-w-none md:!max-w-none lg:!max-w-none !rounded-none !border-none !bg-black !p-0 text-white overflow-hidden flex flex-col gap-0 shadow-none">
        <div className="flex-1 overflow-y-auto w-full p-6 md:p-12 scrollbar-thin scrollbar-thumb-zinc-800 bg-[#000000]">
          
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-1">
             <h1 className="text-3xl font-bold text-white tracking-tight">Create Season</h1>
             <p className="text-zinc-500 font-medium">Set up a new promotional season with approved promoters</p>
          </div>

          <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-8 shadow-sm">
            <div className="space-y-1 mb-8">
               <div className="flex items-center gap-2">
                 <Calendar className="h-5 w-5 text-white" />
                 <h2 className="text-lg font-bold text-white tracking-tight">Create New Season</h2>
               </div>
               <p className="text-sm text-zinc-500 pl-7">Set up a new promotional season</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 max-w-2xl">
                <Label htmlFor="season" className="text-sm font-semibold text-zinc-300">Season Name</Label>
                <Input
                  id="season"
                  className="h-11 bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                  value={formData.Season}
                  onChange={(e) => handleChange("Season", e.target.value)}
                  placeholder="Summer 2025"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-semibold text-zinc-300">Start Date</Label>
                  <Input
                    id="startDate"
                    className="h-11 bg-black border-zinc-800 text-white focus-visible:ring-zinc-700 dark:[color-scheme:dark]"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-semibold text-zinc-300">End Date</Label>
                  <Input
                    id="endDate"
                    className="h-11 bg-black border-zinc-800 text-white focus-visible:ring-zinc-700 dark:[color-scheme:dark]"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 max-w-2xl">
                <Label htmlFor="amount" className="text-sm font-semibold text-zinc-300">Season Amount (₹)</Label>
                <Input
                  id="amount"
                  className="h-11 bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                  type="number"
                  value={formData.amount || ""}
                  onChange={(e) => handleChange("amount", Number.parseFloat(e.target.value) || 0)}
                  placeholder="Example: 1000"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="space-y-2">
                  <Label htmlFor="promotersCommission" className="text-sm font-semibold text-zinc-300">
                    Promoter Commission (₹)
                  </Label>
                  <Input
                    id="promotersCommission"
                    className="h-11 bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                    type="number"
                    value={formData.promotersCommission || ""}
                    onChange={(e) => handleChange("promotersCommission", Number.parseFloat(e.target.value) || 0)}
                    placeholder="Example: 400"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promotersRepaymentCommission" className="text-sm font-semibold text-zinc-300">
                    Promoter Repayment Commission (₹)
                  </Label>
                  <Input
                    id="promotersRepaymentCommission"
                    className="h-11 bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                    type="number"
                    value={formData.promotersRepaymentCommission || ""}
                    onChange={(e) => handleChange("promotersRepaymentCommission", Number.parseFloat(e.target.value) || 0)}
                    placeholder="Example: 50"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {errorStatus && (
                <div className="p-3 border border-red-900/50 rounded-lg flex items-center justify-start mt-4 max-w-4xl">
                  <span className="text-sm text-red-500 font-medium">{errorStatus}</span>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={submitting || loadingPromoters} className="bg-white text-black hover:bg-zinc-200 font-bold px-8 h-11">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Season
                </Button>
                <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={submitting} className="border-zinc-800 bg-[#09090b] text-white hover:bg-zinc-900 hover:text-white px-8 h-11 font-bold">
                  Cancel
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-[#09090b] border border-zinc-800 rounded-xl overflow-hidden flex flex-col mt-8">
            <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-white" />
                  <h3 className="text-lg font-bold text-white tracking-tight">Select Promoters</h3>
                </div>
                <p className="text-sm text-zinc-500">Choose which promoters can participate in this season</p>
              </div>
              <div className="text-sm font-bold text-white bg-black border border-zinc-800 px-4 py-1.5 rounded-full">
                 {activePromoters.size} selected
              </div>
            </div>

            <div className="p-6 space-y-6 bg-black/40">
              <div className="flex flex-col md:flex-row gap-4">
                 <div className="relative flex-1">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                   <Input 
                     placeholder="Search promoters..." 
                     className="pl-11 h-12 bg-black border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700 w-full rounded-lg"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                 </div>
                 <div className="flex items-center gap-3 shrink-0">
                   <Button variant="outline" type="button" onClick={() => toggleAll(true)} className="bg-black border-zinc-800 text-white hover:bg-zinc-900 h-12 px-6 rounded-lg font-bold shadow-sm">Select All</Button>
                   <Button variant="outline" type="button" onClick={() => setActivePromoters(new Set())} className="bg-black border-zinc-800 text-white hover:bg-zinc-900 h-12 px-6 rounded-lg font-bold shadow-sm">Clear All</Button>
                 </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="showApproved" 
                  checked={showOnlyApproved} 
                  onCheckedChange={(c) => setShowOnlyApproved(!!c)} 
                  className="border-zinc-500 h-5 w-5 data-[state=checked]:bg-white data-[state=checked]:text-black rounded"
                />
                <label
                  htmlFor="showApproved"
                  className="text-[15px] font-bold leading-none text-white cursor-pointer select-none"
                >
                  Show only approved promoters
                </label>
              </div>

              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#09090b] max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                {loadingPromoters ? (
                    <div className="flex justify-center items-center py-20 text-zinc-500 space-x-3">
                      <Loader2 className="animate-spin h-6 w-6" />
                      <span className="text-sm font-medium">Loading promoters database...</span>
                    </div>
                ) : (
                  <div className="flex flex-col">
                    {filteredPromoters.map((p, index) => (
                      <div key={p._id} className={cn("flex items-center justify-between p-5 hover:bg-zinc-800/20 transition-colors", index !== filteredPromoters.length - 1 ? "border-b border-zinc-800/60" : "", activePromoters.has(p._id) ? "bg-zinc-900/30" : "")}>
                        <div className="flex items-start gap-5">
                          <Checkbox
                              checked={activePromoters.has(p._id)}
                              onCheckedChange={(checked) => togglePromoter(p._id, !!checked)}
                              className="mt-1.5 border-zinc-600 h-5 w-5 data-[state=checked]:bg-white data-[state=checked]:text-black rounded shadow-sm"
                          />
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-white text-[15px]">{p.username}</span>
                              {p.status === "approved" || p.wasActiveLastSeason ? (
                                <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 font-bold border border-emerald-500/20 text-[11px] px-2.5 py-0.5 rounded-md">approved</Badge>
                              ) : (
                                <Badge className="bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/10 font-bold border border-zinc-500/20 text-[11px] px-2.5 py-0.5 rounded-md">unapproved</Badge>
                              )}
                            </div>
                            <div className="text-zinc-500 text-sm tracking-wide">{p.email}</div>
                            <div className="text-zinc-600 text-[13px] font-mono">ID: {p.userid}</div>
                          </div>
                        </div>
                        <div className="text-zinc-700 pr-2">
                           <UserCheck className="h-6 w-6" />
                        </div>
                      </div>
                    ))}
                    {filteredPromoters.length === 0 && (
                      <div className="py-20 text-center text-zinc-500 text-sm font-medium">
                        {searchTerm ? `No promoters found matching "${searchTerm}"` : "No promoters found."}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
}

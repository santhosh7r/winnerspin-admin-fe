"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { seasonAPI } from "@/lib/api"
import { cn } from "@/lib/utils"
import { AlertCircle, Calendar, Loader2, Search, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

interface PromoterEntry {
  _id: string;
  username: string;
  userid?: string;
  mobNo?: string;
  wasActiveLastSeason?: boolean;
  networkPosition?: { type: string; parentPromoter?: { username: string } };
}

export default function CreateSeasonPage() {
  const router = useRouter();
  const [promoters, setPromoters] = useState<PromoterEntry[]>([]);
  const [activePromoters, setActivePromoters] = useState<Set<string>>(new Set());
  const [loadingPromoters, setLoadingPromoters] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    fetchPromoters();
  }, []);

  const fetchPromoters = async () => {
    try {
      setLoadingPromoters(true);
      setError(null);
      const seasonsRes = await seasonAPI.getAll() as { curSeason?: { _id: string }; seasons?: { _id: string }[] };
      const latestSeasonId = seasonsRes.curSeason?._id || seasonsRes.seasons?.[0]?._id;
      
      const pRes = await seasonAPI.getPromotersForNewSeason(latestSeasonId) as { promoters?: PromoterEntry[] };
      const promotersList = pRes.promoters || [];
      setPromoters(promotersList);
      
      const preselected: string[] = promotersList
        .filter((p: PromoterEntry) => p.wasActiveLastSeason)
        .map((p: PromoterEntry) => p._id);
        
      setActivePromoters(new Set(preselected));
    } catch (err) {
      console.error(err);
      setError("Failed to fetch previous season promoters");
    } finally {
      setLoadingPromoters(false);
    }
  };

  const filteredPromoters = useMemo(() => {
    if (!searchTerm) return promoters;
    const s = searchTerm.toLowerCase();
    return promoters.filter(p => 
      (p.username || "").toLowerCase().includes(s) || 
      (p.userid || "").toLowerCase().includes(s) ||
      (p.mobNo || "").toLowerCase().includes(s)
    );
  }, [promoters, searchTerm]);

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
      router.push("/admin/seasons");
    } catch {
      setError("Something went wrong while creating the season.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20 mt-15 lg:mt-0">
      {/* Title section matching image position */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">Create Season</h1>
        <p className="text-muted-foreground">Set up a new promotional season with approved promoters</p>
      </div>

      <div className="space-y-10">
        {/* EXACT DESIGN Card from code snippet & image */}
        <Card className="max-w-4xl border-zinc-800 bg-[#09090b]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5" />
              Create New Season
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Set up a new promotional season
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="season" className="text-zinc-300 font-medium">Season Name</Label>
                <Input
                  id="season"
                  className="bg-black border-zinc-800 text-white placeholder:text-zinc-700 h-10"
                  value={formData.Season}
                  onChange={(e) => handleChange("Season", e.target.value)}
                  placeholder="Summer 2025"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-zinc-300 font-medium">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    className="bg-black border-zinc-800 text-white h-10 dark:invert-0"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-zinc-300 font-medium">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    className="bg-black border-zinc-800 text-white h-10 dark:invert-0"
                    value={formData.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-zinc-300 font-medium">Season Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  className="bg-black border-zinc-800 text-white placeholder:text-zinc-700 h-10"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="promotersCommission" className="text-zinc-300 font-medium">
                    Promoter Commission (₹)
                  </Label>
                  <Input
                    id="promotersCommission"
                    type="number"
                    className="bg-black border-zinc-800 text-white placeholder:text-zinc-700 h-10"
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
                  <Label htmlFor="promotersRepaymentCommission" className="text-zinc-300 font-medium">
                    Promoter Repayment Commission (₹)
                  </Label>
                  <Input
                    id="promotersRepaymentCommission"
                    type="number"
                    className="bg-black border-zinc-800 text-white placeholder:text-zinc-700 h-10"
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
                <div className="p-3 bg-red-950/20 border border-red-900/50 rounded flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">{error}</span>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={submitting} className="bg-white text-black hover:bg-zinc-200 font-bold px-8">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Season
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-zinc-800 text-white hover:bg-zinc-900 font-bold px-8"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Promoter Selector exactly as requested in full-page layout */}
        <section className="bg-[#09090b] border border-zinc-800 rounded-lg overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-zinc-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white font-bold">
                <Users className="h-4 w-4" />
                Select Promoters
              </div>
              <p className="text-zinc-500 text-xs">Choose which promoters can participate in this season</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <Input 
                  placeholder="Search..." 
                  className="pl-9 h-9 bg-black border-zinc-800 text-xs text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => toggleAll(true)} className="border-zinc-800 text-[10px] font-bold h-9">Select All</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => toggleAll(false)} className="border-zinc-800 text-[10px] font-bold h-9">Clear All</Button>
              </div>
              <div className="h-9 px-4 border border-zinc-800 rounded flex items-center gap-2 bg-black">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{activePromoters.size} Selected</span>
              </div>
            </div>
          </div>

          <div className="max-h-[500px] overflow-auto">
            {loadingPromoters ? (
               <div className="flex justify-center items-center py-20 text-zinc-600 gap-2">
                 <Loader2 className="h-4 w-4 animate-spin" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Hydrating...</span>
               </div>
            ) : (
              <Table>
                <TableHeader className="bg-zinc-900/30 sticky top-0 z-10">
                  <TableRow className="border-zinc-800">
                    <TableHead className="w-[60px] px-6">
                      <Checkbox 
                        className="border-zinc-700"
                        checked={filteredPromoters.length > 0 && filteredPromoters.every(p => activePromoters.has(p._id))}
                        onCheckedChange={(checked) => toggleAll(!!checked)}
                      />
                    </TableHead>
                    <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider py-4">Identity</TableHead>
                    <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider">Access ID</TableHead>
                    <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider text-center">Status</TableHead>
                    <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider text-right px-6">Hierarchy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromoters.map((p) => (
                    <TableRow key={p._id} className="border-zinc-900 hover:bg-white/[0.01]">
                      <TableCell className="px-6">
                        <Checkbox
                           className="border-zinc-700"
                           checked={activePromoters.has(p._id)}
                           onCheckedChange={(checked) => togglePromoter(p._id, !!checked)}
                        />
                      </TableCell>
                      <TableCell><span className="text-white font-medium text-sm">{p.username}</span></TableCell>
                      <TableCell><span className="text-zinc-500 font-mono text-xs">{p.userid}</span></TableCell>
                      <TableCell className="text-center">
                         <Badge className={cn("text-[9px] font-bold uppercase px-2 py-0.5 border-none", p.wasActiveLastSeason ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500")}>
                           {p.wasActiveLastSeason ? "Active" : "Inactive"}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                         <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
                            {p.networkPosition?.type === "sub" ? p.networkPosition.parentPromoter?.username : "Root node"}
                         </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

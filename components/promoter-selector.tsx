"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Users, UserCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Promoter {
  _id: string;
  userid: string;
  username: string;
  email: string;
  status: "approved" | "unapproved";
}

interface PromoterSelectorProps {
  promoters: Promoter[];
  selectedPromoters: string[];
  onSelectionChange: (selected: string[]) => void;
  previousSeasonPromoters?: string[];
  loading?: boolean;
}

export function PromoterSelector({
  promoters,
  selectedPromoters,
  onSelectionChange,
  previousSeasonPromoters = [],
  loading = false,
}: PromoterSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyApproved, setShowOnlyApproved] = useState(true);

  // Auto-fill from previous season
  useEffect(() => {
    if (previousSeasonPromoters.length > 0 && selectedPromoters.length === 0) {
      onSelectionChange(previousSeasonPromoters);
    }
  }, [previousSeasonPromoters, selectedPromoters.length, onSelectionChange]);

  const filteredPromoters = promoters.filter((promoter) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      (promoter.username || "").toLowerCase().includes(q) ||
      (promoter.userid || "").toLowerCase().includes(q) ||
      (promoter.email || "").toLowerCase().includes(q);

    const matchesStatus = showOnlyApproved
      ? promoter.status === "approved"
      : true;

    return matchesSearch && matchesStatus;
  });

  const handlePromoterToggle = (promoterId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedPromoters, promoterId]);
    } else {
      onSelectionChange(selectedPromoters.filter((id) => id !== promoterId));
    }
  };

  const handleSelectAll = () => {
    const allIds = filteredPromoters.map((p) => p._id);
    // Merge new selections with existing ones to not lose other filters' selections
    const newSelections = new Set([...selectedPromoters, ...allIds]);
    onSelectionChange(Array.from(newSelections));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleAutoFillPrevious = () => {
    onSelectionChange(previousSeasonPromoters);
  };

  return (
    <div className="bg-[#09090b] border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-white" />
            <h3 className="text-lg font-bold text-white tracking-tight">Select Promoters</h3>
          </div>
          <p className="text-sm text-zinc-500">Choose which promoters can participate in this season</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="text-sm font-bold text-white bg-black border border-zinc-800 px-4 py-1.5 rounded-full shrink-0">
             {selectedPromoters.length} selected
          </div>
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
           <div className="flex items-center gap-3 shrink-0 flex-wrap">
             <Button variant="outline" type="button" onClick={handleSelectAll} className="bg-black border-zinc-800 text-white hover:bg-zinc-900 h-12 px-6 rounded-lg font-bold shadow-sm">Select All</Button>
             <Button variant="outline" type="button" onClick={handleClearAll} className="bg-black border-zinc-800 text-white hover:bg-zinc-900 h-12 px-6 rounded-lg font-bold shadow-sm">Clear All</Button>
             {previousSeasonPromoters.length > 0 && (
               <Button variant="outline" type="button" onClick={handleAutoFillPrevious} className="bg-black border-zinc-800 text-white hover:bg-zinc-900 h-12 px-6 rounded-lg font-bold shadow-sm">
                 Use Previous
               </Button>
             )}
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
          {loading ? (
              <div className="flex justify-center items-center py-20 text-zinc-500 space-x-3">
                <Loader2 className="animate-spin h-6 w-6" />
                <span className="text-sm font-medium">Loading promoters database...</span>
              </div>
          ) : (
            <div className="flex flex-col">
              {filteredPromoters.map((p, index) => {
                const isSelected = selectedPromoters.includes(p._id);
                return (
                <div key={p._id} className={cn("flex items-center justify-between p-5 hover:bg-zinc-800/20 transition-colors", index !== filteredPromoters.length - 1 ? "border-b border-zinc-800/60" : "", isSelected ? "bg-zinc-900/30" : "")}>
                  <div className="flex items-start gap-5">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handlePromoterToggle(p._id, !!checked)}
                        className="mt-1.5 border-zinc-600 h-5 w-5 data-[state=checked]:bg-white data-[state=checked]:text-black rounded shadow-sm"
                    />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-white text-[15px]">{p.username}</span>
                        {p.status === "approved" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 font-bold border border-emerald-500/20 text-[11px] px-2.5 py-0.5 rounded-md">approved</Badge>
                        ) : (
                          <Badge className="bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/10 font-bold border border-zinc-500/20 text-[11px] px-2.5 py-0.5 rounded-md">unapproved</Badge>
                        )}
                        {previousSeasonPromoters.includes(p._id) && (
                          <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/10 font-bold border border-blue-500/20 text-[11px] px-2.5 py-0.5 rounded-md">Previous Season</Badge>
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
              )})}
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
  );
}

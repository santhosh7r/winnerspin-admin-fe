"use client"

import { useState, useEffect } from "react"
import { SeasonForm } from "@/components/season-form"
import { seasonAPI, promoterAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Loader from "@/components/loader"

export default function CreateSeasonPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>(null);

  const [promoters, setPromoters] = useState<any[]>([]);
  const [activePromoters, setActivePromoters] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const handleStep1Submit = async (data: any) => {
    setFormData(data);
    setLoading(true);
    try {
      // Fetch all promoters to display in Step 2
      // Using an empty seasonId to just get global list
      const pRes = await promoterAPI.getAll("");
      const all = pRes.promoters || [
        ...(pRes.approvedPromoters || []),
        ...(pRes.nonApprovedPromoters || []),
        ...(pRes.inactivePromoters || []),
        ...(pRes.allInactivePromoters || [])
      ];
      
      const map = new Map();
      all.forEach((p: any) => map.set(String(p._id), p));
      setPromoters(Array.from(map.values()));
      
      setStep(2);
      return { stay: true }; // prevent native form redirect
    } catch (err) {
      console.error(err);
      alert("Failed to load promoters");
      return;
    } finally {
      setLoading(false);
    }
  }

  const togglePromoter = (id: string, checked: boolean) => {
    setActivePromoters(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSaveAndActivate = async () => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
        promoterIds: Array.from(activePromoters)
      };
      await seasonAPI.create(payload);
      router.push("/admin/seasons");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while creating the season.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-6 mt-15 lg:mt-0 relative">
        <Loader show={loading} />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Season (Step 1)</h1>
          <p className="text-muted-foreground">
            Set up the new promotional season details.
          </p>
        </div>
        <SeasonForm onSubmit={handleStep1Submit} hidePromoters={true} />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-15 lg:mt-0 relative">
      <Loader show={loading} />
      <div>
        <h1 className="text-3xl font-bold text-foreground">Season Transition (Step 2)</h1>
        <p className="text-muted-foreground">
          Promoter Activation for {formData?.Season || "New Season"}
        </p>
      </div>

      <Alert>
        <AlertDescription className="font-medium text-blue-700">
          Note: You can activate more promoters later from their profile pages.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Select Promoters to Activate</CardTitle>
            <CardDescription>Choose promoters to activate immediately for this season.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActivePromoters(new Set(promoters.map(p => p._id)))}>
              Select All
            </Button>
            <Button variant="outline" onClick={() => setActivePromoters(new Set())}>
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Network Size</TableHead>
                  <TableHead>Global Login</TableHead>
                  <TableHead className="text-right">Activate in Season</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center p-4">No promoters found</TableCell>
                  </TableRow>
                ) : (
                  promoters.map(p => (
                    <TableRow key={p._id}>
                      <TableCell>{p.userid || p.username}</TableCell>
                      <TableCell>{p.username}</TableCell>
                      <TableCell>
                        {p.directSubPromoterCount !== undefined 
                          ? p.directSubPromoterCount 
                          : (p.networkSize || p.counts?.totalNetworkPromoters || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.isActive ? "default" : "destructive"}>
                          {p.isActive ? "Can Login" : "Blocked"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Checkbox
                          checked={activePromoters.has(p._id)}
                          onCheckedChange={(checked: boolean | "indeterminate") => togglePromoter(p._id, Boolean(checked))}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>
              Back to Details
            </Button>
            <Button onClick={handleSaveAndActivate} size="lg" disabled={loading}>
              Save Season & Activate Selected Promoters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

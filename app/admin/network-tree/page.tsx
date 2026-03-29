"use client";

import { useState, useEffect, useCallback } from "react";
import { promoterAPI } from "@/lib/api";
import Loader from "@/components/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TreeNode {
  _id: string;
  userid: string;
  username: string;
  isActive: boolean;
  isActiveInSeason: boolean | null;
  children: TreeNode[];
}

export default function NetworkTreePage() {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const fetchTree = useCallback(async () => {
    try {
      setLoading(true);
      const selectedSeason = localStorage.getItem("selectedSeason") || undefined;
      const response = await promoterAPI.getNetworkTree(selectedSeason) as any;
      setTreeData(response.tree || []);
      setNote(response.note || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch network tree");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
    
    // Listen for season changes in local storage if your app does that via an event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedSeason") {
        fetchTree();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchTree]);

  const renderNode = (node: TreeNode, depth: number = 0) => {
    let cardWrapperClass = "mb-4 ms-6 relative";
    let cardClass = "w-64 ";

    if (node.isActiveInSeason === true) {
      cardClass += "border-green-500 bg-card";
    } else if (node.isActiveInSeason === false) {
      cardClass += "border-dashed border-gray-400 bg-gray-100 opacity-70";
    } else {
      cardClass += "bg-gray-100"; // null case
    }

    return (
      <div key={node._id} className={cardWrapperClass}>
        {/* Render a line pointing from parent if depth > 0 */}
        {depth > 0 && (
          <div className="absolute top-6 -left-6 w-6 border-t-2 border-gray-300" />
        )}
        
        <div className="flex flex-col gap-2 relative">
          {/* Vertical line connecting children */}
          {node.children && node.children.length > 0 && (
            <div className="absolute top-[50px] left-[15px] bottom-0 w-0.5 border-l-2 border-gray-300 h-full -z-10" />
          )}

          <Card className={cardClass}>
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm font-bold truncate">
                {node.username}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-1">
              <p className="text-xs text-muted-foreground">{node.userid}</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant={node.isActive ? "default" : "destructive"} className="text-[10px] leading-tight px-1 py-0 h-4">
                  Global: {node.isActive ? "Active" : "Inactive"}
                </Badge>
                {node.isActiveInSeason === false && (
                  <Badge variant="secondary" className="bg-gray-300 text-[10px] leading-tight px-1 py-0 h-4">
                    Inactive this season
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-2 pl-4 border-l-2 border-gray-300 ml-[15px] border-opacity-0">
            {node.children && node.children.length > 0 && (
              <div className="flex flex-col">
                {node.children.map(child => renderNode(child, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative mt-15 lg:mt-0 pb-12">
      <Loader show={loading} />
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Promoter Network Tree</h1>
        <p className="text-muted-foreground">
          View the permanent hierarchy of all promoters overlayed with current season activation status.
        </p>
      </div>

      {note && (
        <Alert>
          <AlertDescription className="font-medium text-blue-700">
            {note}
          </AlertDescription>
        </Alert>
      )}

      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="bg-white p-6 rounded-lg border overflow-x-auto min-h-[500px]">
          {treeData.length === 0 && !loading ? (
            <div className="text-center text-muted-foreground py-12">
              No promoters in the network yet.
            </div>
          ) : (
            <div className="flex flex-col">
              {treeData.map(rootNode => renderNode(rootNode, 0))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

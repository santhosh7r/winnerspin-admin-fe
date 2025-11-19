// "use client";

// import { useEffect, useState } from "react";
// import { posterAPI } from "@/lib/api";
// import Loader from "@/components/loader";
// import type { Poster } from "@/lib/types";

// // shadcn modal components
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogTrigger,
// } from "@/components/ui/dialog";

// import { Button } from "@/components/ui/button";

// export default function PosterManager() {
//   // Upload States
//   const [file, setFile] = useState<File | null>(null);
//   const [audience, setAudience] = useState<"promoter" | "customer">("promoter");
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // List States
//   const [posters, setPosters] = useState<Poster[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [modalOpen, setModalOpen] = useState(false);

//   // Load posters
//   const loadPosters = async () => {
//     setLoading(true);
//     try {
//       const season = localStorage.getItem("selectedSeason");
//       const res = await posterAPI.getAll(season || "");
//       setPosters(res.posters || []);
//     } catch (err) {
//       console.error("Failed loading posters:", err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     loadPosters();
//   }, []);

//   // Upload function
//   const handleUpload = async () => {
//     if (!file) {
//       setError("Please choose a file before uploading.");
//       return;
//     }

//     setUploading(true);
//     setError(null);

//     try {
//       await posterAPI.upload(file, audience);
//       setModalOpen(false);
//       setFile(null);
//       loadPosters();
//     } catch (err) {
//       setError("Upload failed. Please try again.");
//       console.error(err);
//     } finally {
//       setUploading(false);
//     }
//   };

//   // Delete
//   const handleDelete = async (id: string) => {
//     if (!confirm("Delete this poster?")) return;
//     await posterAPI.delete(id);
//     loadPosters();
//   };

//   return (
//     <div className="p-4 lg:p-6 space-y-10">
//       <Loader show={uploading || loading} />

//       {/* Page Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold">Manage Posters</h1>
//           <p className="text-muted-foreground">
//             Upload and manage posters shown to promoters and customers
//           </p>
//         </div>

//         {/* Upload Button (Opens Modal) */}
//         <Dialog open={modalOpen} onOpenChange={setModalOpen}>
//           <DialogTrigger asChild>
//             <Button className="px-6">Upload Poster</Button>
//           </DialogTrigger>

//           {/* Modal */}
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle>Upload Poster</DialogTitle>
//             </DialogHeader>

//             {/* File Input */}
//             <div className="space-y-4 mt-3">
//               <div>
//                 <label className="font-medium">Choose Poster:</label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => setFile(e.target.files?.[0] || null)}
//                   className="w-full border rounded px-2 py-1 cursor-pointer mt-1"
//                 />
//                 {file && (
//                   <p className="text-sm text-gray-600 mt-1">
//                     Selected: <strong>{file.name}</strong>
//                   </p>
//                 )}
//               </div>

//               {/* Audience Select */}
//               <div>
//                 <label className="font-medium">Audience:</label>
//                 <select
//                   value={audience}
//                   onChange={(e) =>
//                     setAudience(e.target.value as "promoter" | "customer")
//                   }
//                   className="w-full border rounded px-2 py-1 mt-1"
//                 >
//                   <option value="promoter">Promoter</option>
//                   <option value="customer">Customer</option>
//                 </select>
//               </div>

//               {error && (
//                 <p className="text-red-600 text-sm text-center">{error}</p>
//               )}
//             </div>

//             <DialogFooter className="mt-4">
//               <Button
//                 variant="outline"
//                 onClick={() => setModalOpen(false)}
//                 className="mr-2"
//               >
//                 Cancel
//               </Button>
//               <Button onClick={handleUpload} disabled={uploading}>
//                 {uploading ? "Uploading..." : "Upload"}
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Poster List */}
//       <div>
//         <h2 className="text-2xl font-bold mb-4">Uploaded Posters</h2>

//         {posters.length === 0 ? (
//           <p className="text-gray-500">No posters uploaded yet.</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {posters.map((poster) => (
//               <div
//                 key={poster._id}
//                 className="bg-white border rounded-lg shadow-sm p-3"
//               >
//                 <img
//                   src={poster.url}
//                   alt={poster.name}
//                   className="w-full h-48 object-cover rounded"
//                 />

//                 <div className="mt-3 space-y-1">
//                   <p className="font-semibold">{poster.name}</p>
//                   <p className="text-sm text-gray-600">
//                     Audience: {poster.audience}
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     Season: {poster.season?.season ?? "No season"}
//                   </p>
//                 </div>

//                 <Button
//                   onClick={() => handleDelete(poster._id)}
//                   className="mt-3 w-full bg-red-600 hover:bg-red-700"
//                 >
//                   Delete
//                 </Button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { posterAPI } from "@/lib/api";
import Image from "next/image";
import Loader from "@/components/loader";
import type { Poster } from "@/lib/types";

// shadcn modal components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

export default function PosterManager() {
  // Upload States
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState<number>(Date.now()); // 🟢 to reset input
  const [audience, setAudience] = useState<"promoter" | "customer">("promoter");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // List States
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  // Load posters
  const loadPosters = async () => {
    setLoading(true);
    try {
      const season = localStorage.getItem("selectedSeason");
      const res = await posterAPI.getAll(season || "");
      setPosters(res.posters || []);
    } catch (err) {
      console.error("Failed loading posters:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPosters();
  }, []);

  // Upload function
  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a file before uploading.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await posterAPI.upload(file, audience);

      // 🟢 Close modal
      setModalOpen(false);

      // 🟢 Clear selected file
      setFile(null);
      setFileKey(Date.now()); // resets the file input UI

      // 🟢 Refresh posters list
      loadPosters();
    } catch (err) {
      setError("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this poster?")) return;

    try {
      await posterAPI.delete(id);
      loadPosters(); // 🟢 refresh after delete
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-10">
      <Loader show={uploading || loading} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Posters</h1>
          <p className="text-muted-foreground">
            Upload and manage posters shown to promoters and customers
          </p>
        </div>

        {/* Upload Button */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button className="px-6">Upload Poster</Button>
          </DialogTrigger>

          {/* Modal */}
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Poster</DialogTitle>
            </DialogHeader>

            {/* File + Audience Fields */}
            <div className="space-y-4 mt-3">
              <div>
                <label className="font-medium">Choose Poster:</label>
                <input
                  key={fileKey} // 🟢 Forces input to reset
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full border rounded px-2 py-1 cursor-pointer mt-1"
                />

                {file && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: <strong>{file.name}</strong>
                  </p>
                )}
              </div>

              <div>
                <label className="font-medium">Audience:</label>
                <select
                  value={audience}
                  onChange={(e) =>
                    setAudience(e.target.value as "promoter" | "customer")
                  }
                  className="w-full border rounded px-2 py-1 mt-1"
                >
                  <option value="promoter">Promoter</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Poster List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Uploaded Posters</h2>

        {posters.length === 0 ? (
          <p className="text-gray-500">No posters uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posters.map((poster) => (
              <div
                key={poster._id}
                className="bg-white border rounded-lg shadow-sm p-3"
              >
                <div className="relative w-full h-48">
                  <Image
                    src={poster.url}
                    alt={poster.name}
                    className="object-cover rounded"
                    fill
                  />
                </div>
                <div className="mt-3 space-y-1">
                  <p className="font-semibold">{poster.name}</p>
                  <p className="text-sm text-gray-600">
                    Audience: {poster.audience}
                  </p>
                  <p className="text-sm text-gray-600">
                    Season: {poster.season?.season ?? "No season"}
                  </p>
                </div>

                <Button
                  onClick={() => handleDelete(poster._id)}
                  className="mt-3 w-full bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

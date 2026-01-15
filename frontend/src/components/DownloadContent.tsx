"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download as DownloadIcon, FolderOpen, Trash2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { getVideoFromDB, deleteVideoFromDB } from "@/utils/indexedDB"; // Import DB utils

export default function DownloadsContent() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [localVideoUrls, setLocalVideoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) loadDownloads();
  }, [user]);

  const loadDownloads = async () => {
    if (!user) return;
    try {
  
      const res = await axiosInstance.get(`/downloads/${user._id}`);
      setDownloads(res.data);

   
      const urls: Record<string, string> = {};
      
      for (const item of res.data) {
        if (item.videoId) {
           const blob = await getVideoFromDB(item.videoId._id);
           if (blob) {
      
             urls[item.videoId._id] = URL.createObjectURL(blob);
           }
        }
      }
      setLocalVideoUrls(urls);

    } catch (error) {
      console.error("Error loading downloads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!user) return;
    try {
   
      await axiosInstance.delete(`/downloads/${user._id}/${videoId}`);
      
   
      await deleteVideoFromDB(videoId);
      
    
      setDownloads((prev) => prev.filter((item) => item.videoId._id !== videoId));
      

      if (localVideoUrls[videoId]) {
        URL.revokeObjectURL(localVideoUrls[videoId]);
        const newUrls = { ...localVideoUrls };
        delete newUrls[videoId];
        setLocalVideoUrls(newUrls);
      }

    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <DownloadIcon className="w-6 h-6" /> Offline Downloads
        </h2>
      </div>

      <div className="space-y-4">
        {downloads.map((item) => {
          if (!item.videoId) return null;
          const vidId = item.videoId._id;
          const isLocallyAvailable = !!localVideoUrls[vidId];

          return (
            <div key={item._id} className="flex gap-4 group border rounded-lg p-3 hover:bg-gray-50">
              <div className="relative w-48 aspect-video bg-black rounded overflow-hidden">
                
                 <video
                    src={isLocallyAvailable ? localVideoUrls[vidId] : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.videoId.filepath}`}
                    className="object-cover w-full h-full"
                    controls 
                  />
                  {!isLocallyAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs text-center p-2">
                      Not saved on this device <br/> (Streaming from server)
                    </div>
                  )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.videoId.videotitle}</h3>
                <p className="text-sm text-gray-500">{item.videoId.videochanel}</p>
                <div className="mt-2 text-xs font-medium text-green-600 flex items-center gap-1">
                   {isLocallyAvailable ? "Available Offline" : "Online Only"}
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-500"
                onClick={() => handleDelete(vidId)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videopplayer from "@/components/Videopplayer"; 
import PremiumModal from "@/components/PremiumBox"; 
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const index = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [videos, setvideo] = useState<any>(null);
  const [video, setvide] = useState<any>(null);
  const [loading, setloading] = useState(true);

  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    const fetchvideo = async () => {
      if (!id || typeof id !== "string") return;
      try {
        const res = await axiosInstance.get("/video/getall");
        
        const currentVideo = res.data?.filter((vid: any) => vid._id === id);
        setvideo(currentVideo[0]);
        
        setvide(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchvideo();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-black">Loading...</div>;
  }
  
  if (!videos) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-black">Video not found</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Videopplayer 
              video={videos} 
              onOpenPremium={() => setShowPremiumModal(true)} 
            />
            <VideoInfo video={videos} />
            <div id="comments_section" className="scroll-mt-10">
               <Comments videoId={id} />
            </div>
          </div>
          <div>
            <RelatedVideos videos={video} />
          </div>
        </div>
      </div>
      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        videoId={id} 
      />
    </div>
  );
};

export default index;
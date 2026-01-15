"use client";

import React from "react";
import { useUser } from "@/lib/AuthContext";
import CustomVideoPlayer from "./CustomVideoPlayer";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
  onOpenPremium: () => void;
  onNextVideo?: () => void;
}

export default function VideoPlayer({ 
  video, 
  onOpenPremium, 
  onNextVideo 
}: VideoPlayerProps) {
  
  const { user } = useUser();
  const getWatchLimit = () => {
    if (!user) return 5 * 60;
    switch (user.planType) {
      case "Gold":   return Infinity;
      case "Silver": return 10 * 60;
      case "Bronze": return 7 * 60;
      case "Free":   
      default:       return 5 * 60;
    }
  };

  const limitInSeconds = getWatchLimit();

  const handleToggleComments = () => {
    const commentsDiv = document.getElementById("comments_section");
    if (commentsDiv) {
      commentsDiv.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      console.warn("⚠️ Error: Element with id='comments_section' not found in the page.");
    }
  };

  return (
    <div className="w-full aspect-video">
      <CustomVideoPlayer 
        src={`${process.env.BACKEND_URL}/${video?.filepath}`} 
        limitInSeconds={limitInSeconds}
        onOpenPremium={onOpenPremium}
        onNextVideo={onNextVideo}
        toggleComments={handleToggleComments} 
        autoPlay={true}
      />
    </div>
  );
}
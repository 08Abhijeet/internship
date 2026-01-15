import React from "react";
import VideoCard from "./videocard";
import { useUser } from "@/lib/AuthContext"; 

export default function ChannelVideos({ videos }: any) {
  const { user } = useUser(); 
  const myVideos = videos.filter((video: any) => 
    user?.channelname && video.videochanel === user.channelname
  );

  if (myVideos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No videos found for your channel.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {myVideos.map((video: any) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}
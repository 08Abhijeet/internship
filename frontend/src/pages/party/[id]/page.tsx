"use client";

import React from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const VideoConference = dynamic(() => import("@/components/VideoConference"), {
  ssr: false,
  loading: () => <div className="text-white p-10">Loading Video Suite...</div>,
});

export default function PartyPage() {
  const { id } = useParams();

  return (
    <div className="flex flex-col h-screen bg-black">
      <div className="h-14 bg-gray-900 flex items-center px-4 border-b border-gray-800">
        <h1 className="text-white font-bold text-xl">🎥 Watch Party Room: {id}</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 bg-gray-900 relative">
             <VideoConference roomID={id as string} />
        </div>
      </div>
    </div>
  );
}
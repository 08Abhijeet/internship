"use client";

import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  User,
  Download,
  Users,
  X // Close icon
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Channeldialogue from "./channeldialogue";
import { useUser } from "@/lib/AuthContext";
import dynamic from "next/dynamic";
const VideoConference = dynamic(() => import("./VideoConference"), { 
  ssr: false,
  loading: () => <div className="text-white">Loading...</div>
});

const Sidebar = () => {
  const { user } = useUser();
  const [isdialogeopen, setisdialogeopen] = useState(false);


  const [isWatchPartyOpen, setIsWatchPartyOpen] = useState(false);
  const [roomID, setRoomID] = useState("");

  const startWatchParty = () => {
    const newRoomID = `party-${Math.floor(Math.random() * 10000)}`;
    setRoomID(newRoomID);
    setIsWatchPartyOpen(true);
  };

  return (
    <>
      <aside className="w-64 bg-white border-r min-h-screen p-2 relative z-10">
        <nav className="space-y-1">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="w-5 h-5 mr-3" />
              Home
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="ghost" className="w-full justify-start">
              <Compass className="w-5 h-5 mr-3" />
              Explore
            </Button>
          </Link>
          <Link href="/subscriptions">
            <Button variant="ghost" className="w-full justify-start">
              <PlaySquare className="w-5 h-5 mr-3" />
              Subscriptions
            </Button>
          </Link>

         
          <div className="pt-2 pb-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
              onClick={startWatchParty}
            >
              <Users className="w-5 h-5 mr-3" />
              Start Watch Party
            </Button>
          </div>

          {user && (
            <>
              <div className="border-t pt-2 mt-2">
                <Link href="/history">
                  <Button variant="ghost" className="w-full justify-start">
                    <History className="w-5 h-5 mr-3" />
                    History
                  </Button>
                </Link>
                <Link href="/liked">
                  <Button variant="ghost" className="w-full justify-start">
                    <ThumbsUp className="w-5 h-5 mr-3" />
                    Liked videos
                  </Button>
                </Link>
                <Link href="/watch-later">
                  <Button variant="ghost" className="w-full justify-start">
                    <Clock className="w-5 h-5 mr-3" />
                    Watch later
                  </Button>
                </Link>
                <Link href="/downloads">
                  <Button variant="ghost" className="w-full justify-start">
                    <Download className="w-5 h-5 mr-3" />
                    Downloads
                  </Button>
                </Link>
                {user?.channelname ? (
                  <Link href={`/channel/${user.id}`}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="w-5 h-5 mr-3" />
                      Your channel
                    </Button>
                  </Link>
                ) : (
                  <div className="px-2 py-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => setisdialogeopen(true)}
                    >
                      Create Channel
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
        <Channeldialogue
          isopen={isdialogeopen}
          onclose={() => setisdialogeopen(false)}
          mode="create"
        />
      </aside>

     
      {isWatchPartyOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in zoom-in-95 duration-200">
          
     
          <div className="h-14 bg-gray-900 flex items-center justify-between px-6 border-b border-gray-800">
            <div className="text-white font-bold flex items-center gap-2">
              <Users className="text-red-500" />
              <span>Watch Party Room: {roomID}</span>
            </div>
            
           
            <button 
              onClick={() => setIsWatchPartyOpen(false)}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

      
          <div className="flex-1 bg-gray-950">
             <VideoConference roomID={roomID} />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
"use client";

import React from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useUser } from "@/lib/AuthContext";

export default function VideoConference({ roomID }: { roomID: string }) {
  const { user } = useUser();

  const myMeeting = (element: HTMLDivElement | null) => {

    if (!element) return;

    const initMeeting = async () => {
      const appID = 557956542; 
      const serverSecret = "301696086694dc9bc765704fda9f2743"; 
      
      const userID = user?.email || "guest_" + Math.floor(Math.random() * 1000);
      const userName = user?.name || "Guest";

 
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID,
        userName
      );

    
      const zp = ZegoUIKitPrebuilt.create(kitToken);

 
      zp.joinRoom({
        container: element,
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        showScreenSharingButton: true,
        showUserList: true,
        sharedLinks: [
          {
            name: 'Copy Link',
            url: window.location.origin + '/party/' + roomID,
          },
        ],
      });
    };

 
    initMeeting();
  };

  const startRecording = async () => {
  try {
  
    const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: true 
    });

    const mediaRecorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "session-recording.webm";
      a.click();
    };

    mediaRecorder.start();
  } catch (err) {
    console.error("Error recording:", err);
  }
};
  return (
    <div
      className="myCallContainer"
      ref={myMeeting}
      style={{ width: "100%", height: "100vh" }}
    ></div>
  );
}
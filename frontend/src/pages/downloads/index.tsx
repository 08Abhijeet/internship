"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import DownloadsContent from "@/components/DownloadContent";

export default function DownloadsPage() {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <main className="flex-1 h-full overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto">
          <DownloadsContent />
        </div>
      </main>
    </div>
  );
}
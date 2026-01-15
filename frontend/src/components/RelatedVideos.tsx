import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface RelatedVideosProps {
  videos: Array<{
    _id: string;
    videotitle: string;
    videochanel: string;
    views: number;
    createdAt: string;
  }>;
}

export default function RelatedVideos({ videos }: RelatedVideosProps) {

  const BASE_URL = "http://localhost:4000";

  return (
    <div className="space-y-2">
      {videos.map((video) => (
        <Link
          key={video._id}
          href={`/watch/${video._id}`}
          className="flex gap-2 group"
        >
          <div className="relative w-40 aspect-video bg-black rounded overflow-hidden flex-shrink-0">

            <video
              src={`${BASE_URL}/video/play/${video._id}#t=1`}
              preload="metadata"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"

              muted
              playsInline
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
              {video.videotitle}
            </h3>
            <p className="text-xs text-gray-600 mt-1">{video.videochanel}</p>
            <p className="text-xs text-gray-600">
              {video.views ? video.views.toLocaleString() : 0} views •{" "}
              {video.createdAt ? formatDistanceToNow(new Date(video.createdAt)) : ""} ago
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
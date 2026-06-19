"use client";

import { Play } from "lucide-react";
import { getYouTubeThumbnail, getYouTubeWatchUrl } from "@/lib/utils/youtube";

interface YouTubePreviewProps {
  videoId: string;
}

export default function YouTubePreview({ videoId }: YouTubePreviewProps) {
  return (
    <a
      href={getYouTubeWatchUrl(videoId)}
      target="_blank"
      rel="noopener noreferrer"
      className="relative mt-2 block overflow-hidden rounded-xl bg-black/5 group"
    >
      <div className="relative aspect-video">
        <img
          src={getYouTubeThumbnail(videoId)}
          alt="YouTube video"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 transition-transform group-hover:scale-110">
            <Play className="ml-0.5 h-6 w-6 text-white" fill="white" />
          </div>
        </div>
        <div className="absolute inset-0 transition-colors group-hover:bg-black/10" />
      </div>
    </a>
  );
}

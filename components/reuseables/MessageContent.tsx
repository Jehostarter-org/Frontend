"use client";

import React from "react";
import LinkifiedText from "./LinkifiedText";
import YouTubePreview from "./YouTubePreview";
import { extractYouTubeId } from "@/lib/utils/youtube";

interface MessageContentProps {
  text: string;
  className?: string;
}

const URL_REGEX = /(https?:\/\/[^\s<]+|www\.[^\s<]+\.[^\s<]+)/gi;

export default function MessageContent({ text, className }: MessageContentProps) {
  const urls = text.match(URL_REGEX) ?? [];
  const firstYouTubeId = urls
    .map((u) => extractYouTubeId(u))
    .find((id): id is string => id !== null);

  return (
    <span className={className}>
      <LinkifiedText text={text} />
      {firstYouTubeId && <YouTubePreview videoId={firstYouTubeId} />}
    </span>
  );
}

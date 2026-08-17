"use client";

import React from "react";
import Image from "next/image";

const PALETTE = [
  "bg-teal-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-cyan-500",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

interface CommunityAvatarProps {
  name: string;
  src?: string | null;
  className?: string;
  textClassName?: string;
}

export function CommunityAvatar({
  name,
  src,
  className = "",
  textClassName = "",
}: CommunityAvatarProps) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`} aria-label={name}>
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center select-none ${getColor(name)} ${className}`}
      aria-label={name}
    >
      <span className={`font-bold leading-none ${textClassName}`}>
        {getInitials(name)}
      </span>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: string;
  fill?: boolean;
}

function resolveUrl(src: string | null | undefined, fallback: string): string {
  if (!src || src.trim() === "") return fallback;
  // blob: and data: URLs are already absolute — return as-is
  if (src.startsWith("blob:") || src.startsWith("data:")) return src;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `${BACKEND_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}

/** Returns true for URLs that next/image cannot handle (blob:, data:) */
function isRawUrl(src: string): boolean {
  return src.startsWith("blob:") || src.startsWith("data:");
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  fallback = "/images/default-avatar.png",
  fill,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(() => resolveUrl(src, fallback));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setImgSrc(resolveUrl(src, fallback));
  }, [src, fallback]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback);
    }
  };

  const safeSrc = imgSrc && imgSrc.trim() !== "" ? imgSrc : fallback;

  // blob: and data: URLs must bypass next/image entirely — it cannot
  // optimise or proxy them and will throw an "unconfigured host" error.
  if (isRawUrl(safeSrc)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeSrc}
          alt={alt}
          className={className}
          onError={handleError}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={safeSrc}
        alt={alt}
        width={width || 100}
        height={height || 100}
        className={className}
        onError={handleError}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={safeSrc}
        alt={alt}
        fill
        className={className}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={safeSrc}
      alt={alt}
      width={width || 100}
      height={height || 100}
      className={className}
      onError={handleError}
    />
  );
}
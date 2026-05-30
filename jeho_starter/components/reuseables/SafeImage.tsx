"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// Inline SVG used as fallback so we never need a file on disk.
// A simple grey circle with a person silhouette.
const FALLBACK_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='20' fill='%23e2e8f0'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%2394a3b8'/%3E%3Cellipse cx='20' cy='34' rx='12' ry='8' fill='%2394a3b8'/%3E%3C/svg%3E";

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
  if (src.startsWith("blob:") || src.startsWith("data:")) return src;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `${BACKEND_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}

/**
 * Returns true for URLs that next/image cannot optimise and must be
 * rendered with a plain <img> tag:
 *   • blob: / data:  — local object URLs and inline data
 *   • backend media  — http://127.0.0.1 or localhost (private IPs that
 *                      Next.js image optimiser blocks in production builds)
 */
function mustBypassNextImage(src: string): boolean {
  if (src.startsWith("blob:") || src.startsWith("data:")) return true;
  try {
    const { hostname } = new URL(src);
    return (
      hostname === "127.0.0.1" ||
      hostname === "localhost" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.")
    );
  } catch {
    return false;
  }
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  fallback = FALLBACK_SVG,
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

  // Use a plain <img> for URLs next/image cannot proxy (private IPs, blobs)
  if (mustBypassNextImage(safeSrc)) {
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
        width={width ?? 100}
        height={height ?? 100}
        className={className}
        onError={handleError}
      />
    );
  }

  // next/image for everything else (CDN URLs, relative paths, etc.)
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
      width={width ?? 100}
      height={height ?? 100}
      className={className}
      onError={handleError}
    />
  );
}
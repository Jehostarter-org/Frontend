"use client";

import React, { useState } from "react";
import Image from "next/image";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

interface SafeImageProps {
  src:        string;
  alt:        string;
  width?:     number;
  height?:    number;
  className?: string;
  fallback?:  string;
  fill?:      boolean;
}

function resolveUrl(src: string, fallback: string): string {
  if (!src || src.trim() === '') return fallback;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return `${BACKEND_URL}${src.startsWith('/') ? '' : '/'}${src}`;
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
  const [imgSrc, setImgSrc]     = useState(() => resolveUrl(src, fallback));
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback);
    }
  };

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 100}
      height={height || 100}
      className={className}
      onError={handleError}
    />
  );
}
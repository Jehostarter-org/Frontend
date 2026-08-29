"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Download, FileText, File, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: string;
  mediaName?: string;
  mediaSize?: number;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

export function isMediaType(type: string, category: "image" | "video" | "audio" | "pdf"): boolean {
  const ext = getFileExtension(type);
  switch (category) {
    case "image":
      return type.startsWith("image/") || [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"].includes(ext);
    case "video":
      return type.startsWith("video/") || [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"].includes(ext);
    case "audio":
      return type.startsWith("audio/") || [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"].includes(ext);
    case "pdf":
      return type === "application/pdf" || ext === "pdf";
    default:
      return false;
  }
}

export function MediaViewer({
  isOpen,
  onClose,
  mediaUrl,
  mediaType,
  mediaName = "File",
  mediaSize = 0
}: MediaViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const originalOverflow = React.useRef<string>("");

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      originalOverflow.current = document.body.style.overflow;
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      // Only show loading spinner for types that load asynchronously
      const needsLoading =
        isMediaType(mediaType, "image") ||
        isMediaType(mediaType, "video") ||
        isMediaType(mediaType, "audio");
      setIsLoading(needsLoading);
      setError(null);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow.current;
    };
  }, [isOpen, handleKeyDown, mediaType]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (isMediaType(mediaType, "image")) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={mediaUrl}
            alt={mediaName}
            className="max-w-full max-h-full object-contain"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError("Failed to load image");
              setIsLoading(false);
            }}
          />
        </div>
      );
    }

    if (isMediaType(mediaType, "video")) {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <video
            src={mediaUrl}
            controls
            autoPlay
            className="max-w-full max-h-full"
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setError("Failed to load video");
              setIsLoading(false);
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (isMediaType(mediaType, "audio")) {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-8">
          <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
            <Play size={48} className="text-blue-400 ml-2" />
          </div>
          <audio
            src={mediaUrl}
            controls
            autoPlay
            className="w-full max-w-md"
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setError("Failed to load audio");
              setIsLoading(false);
            }}
          />
        </div>
      );
    }

    if (isMediaType(mediaType, "pdf")) {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-8">
          <div className="w-24 h-24 bg-red-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <FileText size={48} className="text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">{mediaName}</h3>
          <p className="text-sm text-slate-500 mb-6">
            PDF • {mediaSize > 0 ? formatFileSize(mediaSize) : "Document"}
          </p>
          <div className="flex items-center gap-3">
            <a
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-md"
            >
              <FileText size={16} />
              Open PDF
            </a>
            <a
              href={mediaUrl}
              download={mediaName}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-sm transition-colors"
            >
              <Download size={16} />
              Download
            </a>
          </div>
        </div>
      );
    }

    // For other document types (Word, Excel, etc.)
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <FileText size={48} className="text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">{mediaName}</h3>
        <p className="text-sm text-slate-500 mb-6">
          {mediaSize > 0 ? formatFileSize(mediaSize) : "Document"}
        </p>
        <div className="flex items-center gap-3">
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-md"
          >
            <File size={16} />
            Open file
          </a>
          <a
            href={mediaUrl}
            download={mediaName}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-sm transition-colors"
          >
            <Download size={16} />
            Download
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 text-white z-10">
        <div className="flex items-center gap-3 min-w-0">
          <File size={20} className="text-slate-300" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{mediaName}</p>
            {mediaSize > 0 && (
              <p className="text-xs text-slate-400">{formatFileSize(mediaSize)}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(mediaUrl, "_blank")}
            className="text-white hover:bg-white/10"
            title="Open in new tab"
          >
            <Download size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X size={24} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <FileText size={48} className="text-red-400 mb-4" />
            <p className="text-lg font-medium mb-2">Error loading media</p>
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}
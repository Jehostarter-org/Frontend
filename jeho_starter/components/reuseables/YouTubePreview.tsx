"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Play, X, GripVertical } from "lucide-react";
import { getYouTubeThumbnail } from "@/lib/utils/youtube";

interface YouTubePreviewProps {
  videoId: string;
}

export default function YouTubePreview({ videoId }: YouTubePreviewProps) {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      dragging.current = true;
      const rect = dragRef.current.getBoundingClientRect();
      offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      setPos({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    },
    [],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    if (!playing) return;
    setPos({
      x: Math.max(20, (window.innerWidth - 480) / 2),
      y: Math.max(20, (window.innerHeight - 300) / 2),
    });
  }, [playing]);

  return (
    <>
      {/* Thumbnail — click to pop up */}
      <button
        onClick={() => setPlaying(true)}
        className="relative mt-2 block w-full overflow-hidden rounded-xl bg-black/5 group cursor-pointer"
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
      </button>

      {/* Draggable popup — portalled to body so it escapes parent stacking contexts */}
      {playing &&
        createPortal(
          <>
            {/* Dim backdrop */}
            <div
              className="fixed inset-0 z-[999] bg-black/30"
              onClick={() => setPlaying(false)}
            />

            <div
              ref={dragRef}
              className="fixed z-[1000] w-[90vw] max-w-[480px] rounded-2xl shadow-2xl overflow-hidden bg-black ring-1 ring-white/10"
              style={{ left: pos.x, top: pos.y, touchAction: "none" }}
            >
              {/* Drag handle / title bar */}
              <div
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="flex items-center justify-between px-3 py-2 bg-gray-900 cursor-grab active:cursor-grabbing select-none"
              >
                <div className="flex items-center gap-2 text-white/70">
                  <GripVertical size={16} />
                  <span className="text-xs font-semibold tracking-wide uppercase">
                    YouTube
                  </span>
                </div>
                <button
                  onClick={() => setPlaying(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Player */}
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                  title="YouTube video"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}

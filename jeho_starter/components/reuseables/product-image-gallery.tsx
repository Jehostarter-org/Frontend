'use client';

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SafeImage } from '@/components/reuseables/SafeImage';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  title?: string;
  className?: string;
}

export function ProductImageGallery({ images, title = 'Product', className }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  const goToImage = useCallback((index: number) => {
    if (index === currentIndex) return;
    setFadeState('out');
    setTimeout(() => {
      setCurrentIndex(index);
      setFadeState('in');
    }, 200);
  }, [currentIndex]);

  const goNext = useCallback(() => {
    if (images.length <= 1) return;
    goToImage((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, goToImage]);

  const goPrev = useCallback(() => {
    if (images.length <= 1) return;
    goToImage((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, goToImage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'Escape') setIsZoomed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  if (!images.length) {
    return (
      <div className={cn('relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center', className)}>
        <span className="text-gray-400 text-sm font-medium">No images available</span>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <>
      {/* Main Gallery */}
      <div className={cn('relative group', className)}>
        {/* Main Image Container */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl shadow-gray-200/50">
          {/* Image with fade transition */}
          <div
            className={cn(
              'absolute inset-0 transition-opacity duration-300 ease-in-out',
              fadeState === 'in' ? 'opacity-100' : 'opacity-0'
            )}
          >
            <SafeImage
              src={currentImage}
              alt={`${title} - Image ${currentIndex + 1}`}
              fill
              className="object-cover"
            />
          </div>

          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />

          {/* Navigation Arrows - Fade in on hover */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-gray-800" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-gray-800" />
              </button>
            </>
          )}

          {/* Zoom Button */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsZoomed(true); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
            aria-label="Zoom image"
          >
            <Maximize2 className="h-4 w-4 text-gray-800" />
          </button>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-sm font-medium tracking-wide">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => goToImage(idx)}
                className={cn(
                  'relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-300',
                  currentIndex === idx
                    ? 'ring-2 ring-teal-500 ring-offset-2 scale-95 shadow-lg'
                    : 'opacity-60 hover:opacity-100 hover:scale-105'
                )}
              >
                <SafeImage
                  src={img}
                  alt={`${title} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                />
                {currentIndex === idx && (
                  <div className="absolute inset-0 bg-teal-500/10" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-300"
          onClick={() => setIsZoomed(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            aria-label="Close zoom"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Zoomed Image */}
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] p-8" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <SafeImage
                src={currentImage}
                alt={`${title} - Zoomed view`}
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Zoom Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8 text-white" />
              </button>
            </>
          )}

          {/* Zoom Counter */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md text-white text-lg font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

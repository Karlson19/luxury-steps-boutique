'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

interface Props {
  images: string[];
  alt: string;
  tag?: string | null;
  tagStyle?: string;
}

export default function ImageGallery({ images, alt, tag, tagStyle }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Keyboard nav in lightbox
  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') setActive((p) => (p + 1) % images.length);
      if (e.key === 'ArrowLeft') setActive((p) => (p - 1 + images.length) % images.length);
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, images.length]);

  const next = useCallback(() => setActive((p) => (p + 1) % images.length), [images.length]);
  const prev = useCallback(() => setActive((p) => (p - 1 + images.length) % images.length), [images.length]);

  // Mobile swipe
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next(); else prev();
    }
    touchStartX.current = null;
  }

  // Desktop zoom-on-hover
  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div
          ref={containerRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseMove={onMouseMove}
          onMouseLeave={() => setZoomPos(null)}
          onClick={() => setLightbox(true)}
          className="relative aspect-[4/5] overflow-hidden bg-gray-100 rounded-2xl sm:rounded-3xl group cursor-zoom-in"
        >
          {images.map((img, i) => (
            <div
              key={img + i}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                i === active ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <Image
                src={img}
                alt={`${alt} — view ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out"
                style={
                  i === active && zoomPos
                    ? { transform: 'scale(1.6)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                    : undefined
                }
              />
            </div>
          ))}

          {/* Tag */}
          {tag && (
            <span className={`absolute top-4 left-4 text-[10px] font-bold px-3 py-1.5 tracking-wider uppercase rounded-full shadow-md backdrop-blur-sm ${tagStyle ?? 'bg-gray-900/95 text-white'}`}>
              {tag}
            </span>
          )}

          {/* Zoom hint badge */}
          <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Maximize2 size={15} strokeWidth={2} className="text-gray-700" />
          </div>

          {/* Arrows (desktop) */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 backdrop-blur rounded-full items-center justify-center shadow-md hover:bg-white hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft size={18} strokeWidth={2} className="text-gray-900" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 backdrop-blur rounded-full items-center justify-center shadow-md hover:bg-white hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight size={18} strokeWidth={2} className="text-gray-900" />
              </button>
            </>
          )}

          {/* Counter pill */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
              {active + 1} / {images.length}
            </div>
          )}

          {/* Mobile dots */}
          {images.length > 1 && (
            <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActive(i); }}
                  className={`rounded-full transition-all duration-300 ${
                    i === active ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
                  }`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {images.slice(0, 5).map((img, i) => (
              <button
                key={img + i}
                onClick={() => setActive(i)}
                className={`relative aspect-square overflow-hidden rounded-xl transition-all duration-200 ${
                  active === i
                    ? 'ring-2 ring-[#C8102E] ring-offset-2 scale-100'
                    : 'opacity-50 hover:opacity-100 hover:scale-[1.02]'
                }`}
              >
                <Image src={img} alt={`thumb ${i + 1}`} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm animate-fade-in flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
            aria-label="Close"
          >
            <X size={20} strokeWidth={2} />
          </button>

          <div className="absolute top-6 left-6 text-white/70 text-xs font-bold tracking-wider uppercase">
            {active + 1} of {images.length}
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                aria-label="Previous"
              >
                <ChevronLeft size={22} strokeWidth={2} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                aria-label="Next"
              >
                <ChevronRight size={22} strokeWidth={2} />
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-5xl h-[80vh] mx-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <Image
              src={images[active]}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}

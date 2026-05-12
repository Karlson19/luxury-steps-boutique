'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  Share2,
  ZoomIn,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

const TAG_COLORS: Record<string, string> = {
  New: 'bg-[#C9956C] text-white',
  Bestseller: 'bg-[#C8102E] text-white',
  Limited: 'bg-[#1A0A10] text-white',
  Sale: 'bg-red-600 text-white',
};

interface Props {
  images: string[];
  alt: string;
  tag?: string | null;
  productSlug: string;
  isWished: boolean;
  onWishToggle: () => void;
}

export default function ProductImageGallery({
  images,
  alt,
  tag,
  productSlug,
  isWished,
  onWishToggle,
}: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [imgLoaded, setImgLoaded] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const next = useCallback(
    () => setActive((p) => (p + 1) % images.length),
    [images.length],
  );
  const prev = useCallback(
    () => setActive((p) => (p - 1 + images.length) % images.length),
    [images.length],
  );

  // Lightbox keyboard
  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, next, prev]);

  // Mobile scroll-snap → update active
  useEffect(() => {
    const node = mobileScrollRef.current;
    if (!node) return;
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!node) return;
        const idx = Math.round(node.scrollLeft / node.clientWidth);
        setActive((cur) => (cur === idx ? cur : idx));
      });
    }
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      node.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Image cross-fade on change
  useEffect(() => {
    setImgLoaded(false);
    const t = setTimeout(() => setImgLoaded(true), 50);
    return () => clearTimeout(t);
  }, [active]);

  function selectThumb(i: number) {
    setActive(i);
    const node = mobileScrollRef.current;
    if (node) {
      node.scrollTo({ left: i * node.clientWidth, behavior: 'smooth' });
    }
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!mainRef.current) return;
    const r = mainRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setZoom({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/products/${productSlug}`
        : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: alt, url });
        return;
      } catch {
        // user cancelled
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied ✦');
    } catch {
      toast.error('Could not copy link');
    }
  }

  return (
    <div className="w-full">
      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:flex lg:flex-row-reverse lg:gap-4">
        {/* Main image */}
        <div className="flex-1 min-w-0">
          <div
            ref={mainRef}
            onMouseMove={onMouseMove}
            onMouseLeave={() => setZoom(null)}
            onClick={() => setLightbox(true)}
            className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-rose-mid border border-bone cursor-zoom-in"
            style={{ boxShadow: '0 1px 4px rgba(123,29,46,0.07)' }}
          >
            <Image
              src={images[active]}
              alt={`${alt} — view ${active + 1}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={`object-cover transition-opacity duration-[250ms] ease-in-out ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* TOP-LEFT — tag */}
            {tag && (
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-md ${
                    TAG_COLORS[tag] ?? 'bg-[#1A0A10] text-white'
                  }`}
                  style={{ fontFamily: 'var(--font-jost)' }}
                >
                  {tag}
                </span>
              </div>
            )}

            {/* TOP-RIGHT — wishlist + share */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWishToggle();
                }}
                aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
                className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-200"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isWished
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-ink-500'
                  }`}
                  strokeWidth={2}
                />
              </button>
              <button
                onClick={handleShare}
                aria-label="Share product"
                className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-200"
              >
                <Share2 className="w-4 h-4 text-ink-500" strokeWidth={2} />
              </button>
            </div>

            {/* Zoom hint */}
            <div className="absolute bottom-3 right-3 w-9 h-9 bg-white/85 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              <ZoomIn className="w-4 h-4 text-ink-500" strokeWidth={2} />
            </div>

            {/* Zoom lens — desktop only */}
            {zoom && (
              <div
                className="absolute pointer-events-none rounded-xl border-2 border-white/70 shadow-xl"
                style={{
                  width: 120,
                  height: 120,
                  left: `calc(${zoom.x}% - 60px)`,
                  top: `calc(${zoom.y}% - 60px)`,
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(2px)',
                  transition: 'opacity 150ms ease-in-out',
                }}
              />
            )}
          </div>
        </div>

        {/* Thumbnails — left rail on desktop */}
        {images.length > 1 && (
          <div className="w-[72px] flex-shrink-0 flex flex-col gap-2.5 overflow-y-auto max-h-[600px] scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={img + i}
                onClick={() => selectThumb(i)}
                className={`relative aspect-square w-full rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                  active === i
                    ? 'border-burgundy opacity-100 scale-[1.04] shadow-md'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                style={
                  active === i
                    ? { boxShadow: '0 4px 12px rgba(123,29,46,0.20)' }
                    : undefined
                }
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={img}
                  alt={`thumb ${i + 1}`}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MOBILE / TABLET LAYOUT */}
      <div className="lg:hidden flex flex-col gap-3">
        {/* Scroll-snap container */}
        <div className="relative">
          <div
            ref={mobileScrollRef}
            className="flex overflow-x-auto scrollbar-hide rounded-2xl"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {images.map((img, i) => (
              <div
                key={img + i}
                className="relative flex-shrink-0 w-full aspect-[3/4] bg-rose-mid"
                style={{ scrollSnapAlign: 'start' }}
                onClick={() => setLightbox(true)}
              >
                <Image
                  src={img}
                  alt={`${alt} — view ${i + 1}`}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* TOP-LEFT — tag */}
          {tag && (
            <span
              className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-md ${
                TAG_COLORS[tag] ?? 'bg-[#1A0A10] text-white'
              }`}
              style={{ fontFamily: 'var(--font-jost)' }}
            >
              {tag}
            </span>
          )}

          {/* TOP-RIGHT — wishlist + share */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button
              onClick={onWishToggle}
              aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
              className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center active:scale-90 transition-all duration-200"
            >
              <Heart
                className={`w-4 h-4 ${
                  isWished
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-ink-500'
                }`}
                strokeWidth={2}
              />
            </button>
            <button
              onClick={handleShare}
              aria-label="Share product"
              className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center active:scale-90 transition-all duration-200"
            >
              <Share2 className="w-4 h-4 text-ink-500" strokeWidth={2} />
            </button>
          </div>

          {/* BOTTOM — counter pill */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
              <span
                className="text-[11px] font-medium text-white"
                style={{ fontFamily: 'var(--font-jost)' }}
              >
                {active + 1} / {images.length}
              </span>
            </div>
          )}
        </div>

        {/* Mobile thumbnail row */}
        {images.length > 1 && (
          <div className="flex flex-row gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {images.map((img, i) => (
              <button
                key={img + i}
                onClick={() => selectThumb(i)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                  active === i
                    ? 'border-burgundy opacity-100 scale-[1.04]'
                    : 'border-transparent opacity-70'
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={img}
                  alt={`thumb ${i + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* LIGHTBOX — portal */}
      {lightbox && mounted && typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[80] bg-[#1A0A10]/90 backdrop-blur-md flex items-center justify-center w-full h-full p-4 sm:p-8 animate-fade-in"
            onClick={() => setLightbox(false)}
          >
            {/* Close */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(false);
              }}
              aria-label="Close"
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>

            {/* Counter */}
            <div
              className="absolute top-6 left-6 text-white/70 text-xs uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-jost)', fontWeight: 500 }}
            >
              {active + 1} / {images.length}
            </div>

            {/* Prev / Next */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image */}
            <div
              className="relative max-w-3xl w-full aspect-[3/4] sm:aspect-auto sm:max-h-[85vh] animate-scale-in"
              onClick={(e) => e.stopPropagation()}
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

            {/* Bottom thumbnail strip */}
            {images.length > 1 && (
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto scrollbar-hide max-w-[90vw] px-4"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setActive(i)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      active === i
                        ? 'border-white scale-[1.04] opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image src={img} alt="" fill sizes="48px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

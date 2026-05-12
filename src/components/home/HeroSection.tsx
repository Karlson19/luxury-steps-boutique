'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown } from 'lucide-react';

const HERO_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=90',
    lead: 'Effortless',
    italic: 'elegance.'
  },
  {
    src: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1920&q=90',
    lead: 'Unmatched',
    italic: 'craftsmanship.'
  },
  {
    src: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=90',
    lead: 'Refined',
    italic: 'adornment.'
  },
  {
    src: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=1920&q=90',
    lead: 'Timeless',
    italic: 'silhouettes.'
  },
  {
    src: 'https://images.unsplash.com/photo-1594938298596-70f56fb3cecb?w=1920&q=90',
    lead: 'Modern',
    italic: 'sophistication.'
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex flex-col overflow-hidden bg-[#1A0A0A] w-[calc(100vw+4px)] left-1/2 -translate-x-1/2">

      {/* ─── IMAGE SLIDESHOW ─── */}
      {HERO_SLIDES.map((slide, i) => {
        const isActive = i === currentSlide;
        return (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-[1800ms] ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={slide.src}
              alt={`Luxury Steps Boutique — ${slide.lead} ${slide.italic}`}
              fill
              priority={i === 0}
              className={`object-cover ${isActive ? 'animate-kenburns' : ''}`}
              sizes="100vw"
            />
          </div>
        );
      })}

      {/* ─── CINEMATIC OVERLAYS ─── */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#1A0A0A] via-[#1A0A0A]/50 to-transparent" />
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#1A0A0A]/70 via-[#1A0A0A]/20 to-transparent" />

      {/* ─── TOP BRAND STRIP ─── */}
      <div className={`relative z-30 pt-24 sm:pt-32 px-5 sm:px-6 lg:px-12 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <div className="flex items-center gap-3">
          <span className="block w-6 sm:w-8 h-px" style={{ background: 'linear-gradient(90deg, #C9956C, #FEEFC4)' }} />
          <p
            className="text-[9px] sm:text-[11px] font-bold tracking-[0.45em] uppercase animate-gold-shimmer"
            style={{
              backgroundImage: 'linear-gradient(90deg, #C9956C 0%, #FFF6DC 40%, #C9956C 60%, #FFF6DC 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            L · S · B &nbsp;·&nbsp; Luxury Steps Boutique
          </p>
          <span className="block w-6 sm:w-8 h-px" style={{ background: 'linear-gradient(90deg, #FEEFC4, #C9956C)' }} />
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="relative z-30 flex-1 flex items-end px-5 sm:px-6 lg:px-12 pb-14 sm:pb-20 lg:pb-28">
        <div className="max-w-5xl w-full">

          {/* Animated Headlines */}
          <h1
            className={`text-white leading-[0.92] mb-5 sm:mb-7 transition-all duration-1000 delay-100 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(3.75rem, 13vw, 9.5rem)',
              fontWeight: 500,
            }}
          >
            {HERO_SLIDES.map((slide, i) => {
              const isActive = i === currentSlide;
              const isPrev = i === (currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
              return (
                <span
                  key={i}
                  aria-hidden={!isActive}
                  className={`absolute pointer-events-none transition-all duration-[1200ms] ease-in-out ${
                    isActive
                      ? 'opacity-100 translate-y-0'
                      : isPrev
                        ? 'opacity-0 -translate-y-5'
                        : 'opacity-0 translate-y-5'
                  }`}
                >
                  {slide.lead}
                  <span
                    className="block italic font-light pr-4"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #FEEFC4 50%, #C9956C 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0px 0px 30px rgba(203,161,83,0.2))',
                    }}
                  >
                    {slide.italic}
                  </span>
                </span>
              );
            })}
            <span className="invisible block" aria-hidden="true">
              Uncompromising
              <span className="block italic">craftsmanship.</span>
            </span>
          </h1>

          {/* ─── BRAND TAGLINE ─── */}
          <p
            className={`text-[13px] sm:text-[15px] text-white/75 max-w-sm sm:max-w-md leading-relaxed mb-8 sm:mb-10 transition-all duration-1000 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ fontFamily: 'var(--font-jost)', fontWeight: 300, letterSpacing: '0.02em' }}
          >
          Styled with intention. Worn with confidence.       
          </p>
          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 transition-all duration-1000 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-[#C9956C] text-[#1A0A0A] font-bold text-[10px] sm:text-xs tracking-[0.25em] uppercase px-8 py-4 sm:py-4.5 rounded-full hover:bg-white hover:text-[#1A0A0A] active:scale-[0.97] transition-all duration-500 shadow-[0_0_20px_rgba(203,161,83,0.25)] sm:min-w-[200px]"
            >
              Shop Now
            </Link>
            <Link
              href="/products?sort=newest"
              className="inline-flex items-center justify-center gap-2 border border-white/25 backdrop-blur-md text-white font-bold text-[10px] sm:text-xs tracking-[0.25em] uppercase px-8 py-4 sm:py-4.5 rounded-full hover:bg-white/10 hover:border-white/50 active:scale-[0.97] transition-all duration-500 sm:min-w-[200px]"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM STRIP ─── */}
      <div className="relative z-30 px-5 sm:px-6 lg:px-12 pb-6 sm:pb-8 flex items-center justify-between">
        <div className="flex gap-1.5 sm:gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-500 ${
                i === currentSlide
                  ? 'w-6 sm:w-8 h-1 bg-[#C9956C]'
                  : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
        <div className="hidden sm:flex flex-col items-center gap-1.5 text-white/40">
          <span className="text-[8px] font-bold tracking-[0.35em] uppercase">Scroll</span>
          <ArrowDown size={11} className="animate-bounce text-[#C9956C]" strokeWidth={2.5} />
        </div>
      </div>

      <style jsx global>{`
        @keyframes kenburns {
          0%   { transform: scale(1.0);  }
          100% { transform: scale(1.08); }
        }
        .animate-kenburns {
          animation: kenburns 10s ease-out forwards;
        }
        @keyframes goldShimmer {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .animate-gold-shimmer {
          animation: goldShimmer 5s linear infinite;
        }
      `}</style>
    </section>
  );
}

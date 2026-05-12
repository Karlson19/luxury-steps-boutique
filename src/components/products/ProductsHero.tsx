'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const HERO_SLIDES = [
  {
    // Stiletto heels
    src: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=85&w=2000',
    text: 'Walk into every room like it was made for you.'
  },
  {
    // Structured handbag
    src: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=85&w=2000',
    text: 'A handbag that carries more than just essentials.'
  },
  {
    // Crossbody / shoulder bag
    src: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=85&w=2000',
    text: 'Hands-free ease. Day-to-evening polish.'
  },
  {
    // Pointed-toe pump
    src: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?q=85&w=2000',
    text: 'The right pair changes everything you wear.'
  },
  {
    // Tote bag
    src: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=85&w=2000',
    text: 'Room for the day. Shape that holds.'
  },
  {
    // Slide sandals / flats
    src: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?q=85&w=2000',
    text: 'Comfort you don’t have to apologise for.'
  },
  {
    // Mini clutch
    src: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=85&w=2000',
    text: 'Small bag. Big presence.'
  }
];

interface Props {
  totalCount?: number;
}

export default function ProductsHero({}: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    // ✨ FIXED: Added w-[calc(100vw+4px)] to bleed 2px off each side and destroy the sub-pixel gap!
    <div className="w-[calc(100vw+4px)] relative left-1/2 -translate-x-1/2 mt-[64px] sm:mt-[72px] lg:mt-[88px] mb-8 overflow-hidden">
      
      <div className="relative w-full h-[25svh] sm:h-[30svh] min-h-[260px] max-h-[350px] overflow-hidden bg-[#1A0A0A] flex items-center justify-center group">
        
        {/* ─── IMAGE SLIDESHOW ─── */}
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <Image
                src={slide.src}
                alt="Luxury Steps Boutique"
                fill
                priority={index === 0}
                className={`object-cover transition-transform duration-[10000ms] ease-linear ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          );
        })}

        {/* ─── GRADIENT OVERLAY ─── */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-[#1A0A0A]/60 via-[#1A0A0A]/40 to-[#1A0A0A]/90" />
        <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_0%,#1A0A0A_160%)] opacity-80" />

        {/* ─── TEXT CONTENT ─── */}
        <div className="relative z-30 flex flex-col items-center text-center px-4 w-full max-w-3xl mx-auto py-6">
          
          <div className="flex items-center gap-3 mb-3 sm:mb-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <span className="w-4 sm:w-6 h-px bg-gold" />
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-gold">
              The Catalog
            </p>
            <span className="w-4 sm:w-6 h-px bg-gold" />
          </div>

          <h1 className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '400ms' }}>
            <span
              className="text-4xl sm:text-5xl lg:text-6xl mb-1 leading-none tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-br from-white via-[#FFE0DA] to-[#C9956C]"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontWeight: 600,
                filter: 'drop-shadow(0px 4px 20px rgba(201, 149, 108, 0.25))'
              }}
            >
              L · S · B
            </span>
            <span
              className="text-[9px] sm:text-[10px] text-white/80 uppercase tracking-[0.5em] ml-[0.5em]"
              style={{ fontFamily: 'var(--font-jost)', fontWeight: 600 }}
            >
              Luxury Steps Boutique
            </span>
          </h1>

          {/* Living Subtitle */}
          <div className="relative h-6 mt-4 sm:mt-5 w-full">
            {HERO_SLIDES.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <p 
                  key={index}
                  className={`absolute inset-0 w-full text-base sm:text-lg text-white/85 transition-all duration-1000 ease-in-out ${
                    isActive ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-2 z-0'
                  }`}
                  style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic' }}
                >
                  {slide.text}
                </p>
              );
            })}
          </div>
        </div>

        {/* ─── SLIDE INDICATORS ─── */}
        <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-30 flex justify-center gap-1.5 flex-wrap px-4">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === currentSlide ? 'w-5 bg-[#C9956C]' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

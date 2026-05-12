'use client';

import { useEffect, useState } from 'react';

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'compact' | 'full';
  color?: 'burgundy' | 'white';
  animated?: boolean;
  className?: string;
}

export default function BrandLogo({
  size = 'md',
  variant = 'compact',
  color = 'burgundy',
  animated = true,
  className = '',
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const SIZES = {
    xs: { crown: 14, jcuPx: 13, jcuTrack: '0.18em', dot: 1.5, sub: 6,  subTrack: '0.3em',  gap: 4,  lineW: 12, lineGap: 4 },
    sm: { crown: 18, jcuPx: 20, jcuTrack: '0.18em', dot: 2,   sub: 7,  subTrack: '0.3em',  gap: 5,  lineW: 18, lineGap: 5 },
    md: { crown: 24, jcuPx: 28, jcuTrack: '0.2em',  dot: 2.5, sub: 9,  subTrack: '0.32em', gap: 7,  lineW: 26, lineGap: 6 },
    lg: { crown: 34, jcuPx: 42, jcuTrack: '0.22em', dot: 3,   sub: 11, subTrack: '0.35em', gap: 9,  lineW: 38, lineGap: 8 },
    xl: { crown: 48, jcuPx: 64, jcuTrack: '0.24em', dot: 4,   sub: 14, subTrack: '0.38em', gap: 12, lineW: 56, lineGap: 10 },
  };
  const s = SIZES[size];

  const burgundy  = color === 'white' ? '#FFFFFF' : '#C8102E';
  const gold      = '#C9956C';
  const goldLight = '#DCB089';
  const subtitleColor = color === 'white' ? 'rgba(255,255,255,0.85)' : '#1A0A0A';
  const uid = `lsb-${size}-${color}`;

  const isVisible = !animated || mounted;

  return (
    <span
      className={`jcu-logo group/logo inline-flex flex-col items-center select-none ${className}`}
      style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
      aria-label="Luxury Steps Boutique"
    >
      {/* ── CROSSHAIR CROWN ── */}
      <span
        className="jcu-crown-wrap relative inline-flex items-center justify-center"
        style={{
          width:  s.crown + 8,
          height: s.crown + 8,
          marginBottom: s.gap * 0.6,
          opacity:   isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.4) rotate(-45deg)',
          transition: 'opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 900ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <svg
          width={s.crown + 8}
          height={s.crown + 8}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={animated ? 'jcu-crown-svg' : ''}
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Gold radial gradient for the center diamond */}
            <radialGradient id={`${uid}-rg`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={goldLight} />
              <stop offset="100%" stopColor={gold} />
            </radialGradient>
            {/* Glow filter */}
            <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer orbit ring — slowly rotates */}
          <circle
            cx="16" cy="16" r="14"
            stroke={gold} strokeWidth="0.5" opacity="0.35"
            strokeDasharray="3 4"
            className={animated ? 'jcu-ring-outer' : ''}
          />

          {/* Inner ring */}
          <circle
            cx="16" cy="16" r="10"
            stroke={gold} strokeWidth="0.4" opacity="0.25"
          />

          {/* Crosshair arms — 4 slim lines extending from center */}
          {/* Top */}
          <line x1="16" y1="2"  x2="16" y2="11" stroke={gold} strokeWidth="0.8" opacity="0.7" strokeLinecap="round" className={animated ? 'jcu-arm jcu-arm-top' : ''} />
          {/* Bottom */}
          <line x1="16" y1="21" x2="16" y2="30" stroke={gold} strokeWidth="0.8" opacity="0.7" strokeLinecap="round" className={animated ? 'jcu-arm jcu-arm-bottom' : ''} />
          {/* Left */}
          <line x1="2"  y1="16" x2="11" y2="16" stroke={gold} strokeWidth="0.8" opacity="0.7" strokeLinecap="round" className={animated ? 'jcu-arm jcu-arm-left' : ''} />
          {/* Right */}
          <line x1="21" y1="16" x2="30" y2="16" stroke={gold} strokeWidth="0.8" opacity="0.7" strokeLinecap="round" className={animated ? 'jcu-arm jcu-arm-right' : ''} />

          {/* Diagonal tick marks at 45° */}
          <line x1="5.5"  y1="5.5"  x2="8.5"  y2="8.5"  stroke={gold} strokeWidth="0.5" opacity="0.3" strokeLinecap="round" />
          <line x1="23.5" y1="5.5"  x2="26.5" y2="8.5"  stroke={gold} strokeWidth="0.5" opacity="0.3" strokeLinecap="round" />
          <line x1="5.5"  y1="26.5" x2="8.5"  y2="23.5" stroke={gold} strokeWidth="0.5" opacity="0.3" strokeLinecap="round" />
          <line x1="23.5" y1="26.5" x2="26.5" y2="23.5" stroke={gold} strokeWidth="0.5" opacity="0.3" strokeLinecap="round" />

          {/* Center diamond — the heart of the mark */}
          <path
            d="M16,11.5 L18.5,16 L16,20.5 L13.5,16 Z"
            fill={`url(#${uid}-rg)`}
            filter={`url(#${uid}-glow)`}
            className={animated ? 'jcu-diamond' : ''}
          />

          {/* 4 tiny corner squares at arm tips */}
          <rect x="14.8" y="1.2"  width="2.4" height="2.4" rx="0.4" fill={gold} opacity="0.6" transform="rotate(45 16 2.4)" />
          <rect x="14.8" y="28.4" width="2.4" height="2.4" rx="0.4" fill={gold} opacity="0.6" transform="rotate(45 16 29.6)" />
          <rect x="1.2"  y="14.8" width="2.4" height="2.4" rx="0.4" fill={gold} opacity="0.6" transform="rotate(45 2.4 16)" />
          <rect x="28.4" y="14.8" width="2.4" height="2.4" rx="0.4" fill={gold} opacity="0.6" transform="rotate(45 29.6 16)" />
        </svg>
      </span>

      {/* Decorative side lines (full variant only) */}
      {variant === 'full' && (
        <span
          className="inline-flex items-center justify-center"
          style={{
            gap: s.lineGap * 2,
            marginBottom: s.gap * 0.6,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 800ms cubic-bezier(0.22,1,0.36,1) 200ms',
          }}
        >
          <DecorativeLine width={s.lineW} dot={s.dot} color={gold} side="left"  visible={isVisible} />
          <DecorativeLine width={s.lineW} dot={s.dot} color={gold} side="right" visible={isVisible} />
        </span>
      )}

      {/* ── LSB WORDMARK with shimmer overlay ── */}
      <span
        className="jcu-wordmark relative inline-flex items-center"
        style={{ gap: s.dot * 2.5 }}
      >
        {(['L', 'S', 'B'] as const).map((char, i) => (
          <span key={char} className="inline-flex items-center" style={{ gap: s.dot * 2.5 }}>
            <span
              className={animated ? `jcu-letter jcu-letter-${i}` : ''}
              style={{
                fontStyle:   'italic',
                fontWeight:  700,
                fontSize:    s.jcuPx,
                lineHeight:  1,
                color:       burgundy,
                letterSpacing: '0.02em',
                opacity:   isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
                transition: `opacity 600ms cubic-bezier(0.22,1,0.36,1) ${300 + i * 120}ms, transform 600ms cubic-bezier(0.22,1,0.36,1) ${300 + i * 120}ms, color 220ms ease`,
                display:    'inline-block',
                willChange: 'transform',
                position:   'relative',
              }}
            >
              {char}
            </span>

            {/* Gold dot between letters */}
            {i < 2 && (
              <span
                aria-hidden
                className={animated ? `jcu-dot jcu-dot-${i}` : ''}
                style={{
                  display:      'inline-block',
                  width:        s.dot,
                  height:       s.dot,
                  borderRadius: '50%',
                  background:   gold,
                  opacity:      isVisible ? 1 : 0,
                  transition:   `opacity 400ms ease ${500 + i * 120}ms`,
                }}
              />
            )}
          </span>
        ))}

        {/* Gold shimmer layer — sweeps across the wordmark periodically */}
        {animated && (
          <span
            aria-hidden
            className="jcu-sheen pointer-events-none absolute inset-0"
            style={{
              borderRadius: 999,
              overflow: 'hidden',
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 600ms ease 1000ms',
            }}
          />
        )}

        {/* Monogram gold underline — draws itself on mount */}
        {animated && (
          <span
            aria-hidden
            className="jcu-underline pointer-events-none absolute"
            style={{
              bottom: -3,
              left:   0,
              right:  0,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${gold}, transparent)`,
              opacity:   isVisible ? 0.6 : 0,
              transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: 'center',
              transition: 'opacity 600ms ease 900ms, transform 800ms cubic-bezier(0.22,1,0.36,1) 900ms',
            }}
          />
        )}
      </span>

      {/* COLLECTIONS subtitle (full variant only) */}
      {variant === 'full' && (
        <>
          <span
            aria-hidden
            className="block"
            style={{
              width:      '70%',
              height:     0.6,
              background: gold,
              opacity:    isVisible ? 0.5 : 0,
              marginTop:    s.gap * 0.8,
              marginBottom: s.gap * 0.5,
              transition: 'opacity 600ms ease 700ms',
            }}
          />
          <span
            style={{
              fontFamily:    'var(--font-jost), system-ui, sans-serif',
              fontSize:      s.sub,
              letterSpacing: s.subTrack,
              fontWeight:    500,
              color:         subtitleColor,
              textTransform: 'uppercase',
              opacity:       isVisible ? 0.85 : 0,
              transition:    'opacity 600ms ease 800ms',
            }}
          >
            Boutique
          </span>
        </>
      )}

      {/* ── ANIMATIONS ── */}
      {animated && (
        <style jsx>{`
          /* Outer dashed orbit ring — slow clockwise spin */
          .jcu-ring-outer {
            transform-origin: 16px 16px;
            transform-box: fill-box;
            animation: jcuRingSpin 22s linear infinite;
          }
          @keyframes jcuRingSpin {
            to { transform: rotate(360deg); }
          }

          /* Center diamond — slow breathe with gold glow pulse */
          .jcu-diamond {
            transform-origin: 16px 16px;
            transform-box: fill-box;
            animation: jcuDiamondBreathe 3.5s ease-in-out infinite;
          }
          @keyframes jcuDiamondBreathe {
            0%, 100% { transform: scale(1) rotate(0deg);   opacity: 1;    filter: drop-shadow(0 0 0px rgba(201,149,108,0)); }
            50%       { transform: scale(1.12) rotate(45deg); opacity: 0.9; filter: drop-shadow(0 0 4px rgba(201,149,108,0.7)); }
          }

          /* Crosshair arms — subtle pulse inward/outward */
          .jcu-arm { animation: jcuArmPulse 3.5s ease-in-out infinite; }
          .jcu-arm-top    { animation-delay: 0s; }
          .jcu-arm-right  { animation-delay: 0.175s; }
          .jcu-arm-bottom { animation-delay: 0.35s; }
          .jcu-arm-left   { animation-delay: 0.525s; }
          @keyframes jcuArmPulse {
            0%, 100% { opacity: 0.7; }
            50%       { opacity: 0.35; }
          }

          /* Letters — barely-there float wave J→C→U */
          .jcu-letter { animation: jcuLetterFloat 4.2s ease-in-out infinite; }
          .jcu-letter-0 { animation-delay: 0s; }
          .jcu-letter-1 { animation-delay: 0.18s; }
          .jcu-letter-2 { animation-delay: 0.36s; }
          @keyframes jcuLetterFloat {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(-1.5px); }
          }

          /* Gold dots — heartbeat pulse */
          .jcu-dot { animation: jcuDotPulse 2.6s ease-in-out infinite; }
          .jcu-dot-0 { animation-delay: 0s; }
          .jcu-dot-1 { animation-delay: 0.4s; }
          @keyframes jcuDotPulse {
            0%, 100% { opacity: 0.55; transform: scale(1); }
            50%       { opacity: 1;    transform: scale(1.5); }
          }

          /* Gold sheen — periodic sweep every 6s */
          .jcu-sheen::after {
            content: '';
            position: absolute;
            top: 0; bottom: 0;
            width: 40%;
            background: linear-gradient(
              100deg,
              transparent 0%,
              rgba(201,149,108,0) 30%,
              rgba(212,162,107,0.6) 50%,
              rgba(201,149,108,0) 70%,
              transparent 100%
            );
            mix-blend-mode: overlay;
            transform: translateX(-180%) skewX(-18deg);
            animation: jcuSheen 6s cubic-bezier(0.4,0,0.2,1) infinite;
          }
          @keyframes jcuSheen {
            0%,  55% { transform: translateX(-180%) skewX(-18deg); }
            85%, 100% { transform: translateX(280%)  skewX(-18deg); }
          }

          /* ── HOVER overrides ── */

          /* Diamond spins fast on hover */
          .jcu-logo:hover .jcu-diamond,
          a:hover .jcu-diamond,
          button:hover .jcu-diamond {
            animation: jcuDiamondSpin 600ms cubic-bezier(0.34,1.56,0.64,1) both;
          }
          @keyframes jcuDiamondSpin {
            0%   { transform: scale(1)    rotate(0deg); }
            50%  { transform: scale(1.25) rotate(180deg); filter: drop-shadow(0 0 8px rgba(201,149,108,0.9)); }
            100% { transform: scale(1)    rotate(360deg); }
          }

          /* Ring reverses on hover */
          .jcu-logo:hover .jcu-ring-outer,
          a:hover .jcu-ring-outer,
          button:hover .jcu-ring-outer {
            animation: jcuRingSpinReverse 1s linear infinite;
          }
          @keyframes jcuRingSpinReverse {
            to { transform: rotate(-360deg); }
          }

          /* Arms flash bright */
          .jcu-logo:hover .jcu-arm,
          a:hover .jcu-arm,
          button:hover .jcu-arm {
            animation: jcuArmFlash 300ms ease-out both;
          }
          @keyframes jcuArmFlash {
            0%   { opacity: 0.7; }
            50%  { opacity: 1; }
            100% { opacity: 0.7; }
          }

          /* Letters pop on hover */
          .jcu-logo:hover .jcu-letter,
          a:hover .jcu-letter,
          button:hover .jcu-letter {
            animation: jcuLetterPop 600ms cubic-bezier(0.34,1.56,0.64,1) both;
          }
          .jcu-logo:hover .jcu-letter-0, a:hover .jcu-letter-0, button:hover .jcu-letter-0 { animation-delay: 0ms; }
          .jcu-logo:hover .jcu-letter-1, a:hover .jcu-letter-1, button:hover .jcu-letter-1 { animation-delay: 70ms; }
          .jcu-logo:hover .jcu-letter-2, a:hover .jcu-letter-2, button:hover .jcu-letter-2 { animation-delay: 140ms; }
          @keyframes jcuLetterPop {
            0%   { transform: translateY(0)    scale(1); }
            45%  { transform: translateY(-5px) scale(1.08); color: ${goldLight}; }
            100% { transform: translateY(0)    scale(1); }
          }

          /* Sheen fires immediately on hover */
          .jcu-logo:hover .jcu-sheen::after,
          a:hover .jcu-sheen::after,
          button:hover .jcu-sheen::after {
            animation: jcuSheenFast 900ms cubic-bezier(0.4,0,0.2,1);
          }
          @keyframes jcuSheenFast {
            0%   { transform: translateX(-180%) skewX(-18deg); }
            100% { transform: translateX(280%)  skewX(-18deg); }
          }

          /* Reduced motion */
          @media (prefers-reduced-motion: reduce) {
            .jcu-ring-outer, .jcu-diamond, .jcu-arm,
            .jcu-letter, .jcu-dot, .jcu-sheen::after {
              animation: none !important;
            }
          }
        `}</style>
      )}
    </span>
  );
}

function DecorativeLine({
  width, dot, color, side, visible,
}: { width: number; dot: number; color: string; side: 'left' | 'right'; visible: boolean }) {
  return (
    <span
      className="inline-flex items-center"
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : `translateX(${side === 'left' ? '-12px' : '12px'})`,
        transition: 'opacity 700ms ease 250ms, transform 800ms cubic-bezier(0.22,1,0.36,1) 250ms',
      }}
    >
      <span style={{ width: dot, height: dot, background: color, transform: 'rotate(45deg)', display: 'inline-block' }} />
      <span style={{ width, height: 0.6, background: color }} />
      <span style={{ width: dot, height: dot, background: color, transform: 'rotate(45deg)', display: 'inline-block' }} />
    </span>
  );
}

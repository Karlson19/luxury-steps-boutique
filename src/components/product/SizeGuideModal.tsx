'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Footprints } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

// Standard women's shoe size conversion.
// Foot length in cm is the most reliable measurement — measure heel to longest toe.
const SHOE_SIZES = [
  { eu: '36',   uk: '3',   us: '5',   foot: '22.5' },
  { eu: '37',   uk: '4',   us: '6',   foot: '23.5' },
  { eu: '38',   uk: '5',   us: '7',   foot: '24.0' },
  { eu: '39',   uk: '6',   us: '8',   foot: '24.5' },
  { eu: '40',   uk: '6.5', us: '8.5', foot: '25.0' },
  { eu: '41',   uk: '7',   us: '9',   foot: '25.5' },
  { eu: '42',   uk: '8',   us: '10',  foot: '26.5' },
  { eu: '43',   uk: '9',   us: '11',  foot: '27.0' },
];

export default function SizeGuideModal({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] bg-[#1A0A0A]/70 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 sm:p-8 max-h-[88vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: 'var(--font-jost)' }}
      >
        <button
          onClick={onClose}
          aria-label="Close size guide"
          className="absolute top-4 right-4 w-9 h-9 bg-rose-soft hover:bg-bone rounded-full flex items-center justify-center active:scale-90 transition-all"
        >
          <X className="w-4 h-4 text-ink-500" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Footprints className="w-4 h-4 text-[#C9956C]" strokeWidth={1.75} />
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C9956C]">
            Women&apos;s Shoe Sizes
          </p>
        </div>
        <h3
          className="text-2xl mb-2 text-ink"
          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600 }}
        >
          Size Guide
        </h3>
        <p className="text-xs text-ink-500 mb-5 leading-relaxed" style={{ fontWeight: 300 }}>
          Measure your foot from heel to longest toe in centimetres, then match it to the
          closest row below. We size in EU — half-sizes round up.
        </p>

        <div className="rounded-xl border border-bone overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#C8102E] text-white">
                <th className="px-3 py-3 text-[10px] uppercase tracking-wider" style={{ fontWeight: 600 }}>EU</th>
                <th className="px-3 py-3 text-[10px] uppercase tracking-wider" style={{ fontWeight: 600 }}>UK</th>
                <th className="px-3 py-3 text-[10px] uppercase tracking-wider" style={{ fontWeight: 600 }}>US</th>
                <th className="px-3 py-3 text-[10px] uppercase tracking-wider" style={{ fontWeight: 600 }}>Foot (cm)</th>
              </tr>
            </thead>
            <tbody>
              {SHOE_SIZES.map((r, i) => (
                <tr
                  key={r.eu}
                  className={i % 2 === 0 ? 'bg-white text-ink' : 'bg-champagne text-ink'}
                >
                  <td className="px-3 py-2.5 text-sm" style={{ fontWeight: 600 }}>{r.eu}</td>
                  <td className="px-3 py-2.5 text-sm text-ink-500">{r.uk}</td>
                  <td className="px-3 py-2.5 text-sm text-ink-500">{r.us}</td>
                  <td className="px-3 py-2.5 text-sm text-ink-500 tabular-nums">{r.foot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 rounded-xl bg-rose-soft border border-bone p-4">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7B1818] mb-2">
            Measuring tips
          </p>
          <ul className="space-y-1.5 text-xs text-ink-500 leading-relaxed" style={{ fontWeight: 300 }}>
            <li className="flex gap-2"><span className="text-[#C9956C]">✦</span><span>Measure in the evening — feet swell slightly during the day.</span></li>
            <li className="flex gap-2"><span className="text-[#C9956C]">✦</span><span>Stand on a sheet of paper, mark heel and longest toe, measure between.</span></li>
            <li className="flex gap-2"><span className="text-[#C9956C]">✦</span><span>If between sizes, size up for closed-toe and heels, down for sandals.</span></li>
          </ul>
        </div>

        <p className="text-xs text-ink-500 mt-5 leading-relaxed">
          Still unsure?{' '}
          <a
            href="https://wa.me/233599670944?text=Hi!%20I%27d%20like%20personal%20sizing%20advice."
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C8102E] hover:text-[#7B1818] transition-colors"
            style={{ fontWeight: 600 }}
          >
            Message Rahinatu on WhatsApp
          </a>{' '}
          — she&apos;ll help you pick the right size.
        </p>
      </div>
    </div>,
    document.body,
  );
}

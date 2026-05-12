'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ROWS = [
  { size: 'XS', bust: '78–82', waist: '60–64', hips: '86–90' },
  { size: 'S', bust: '82–86', waist: '64–68', hips: '90–94' },
  { size: 'M', bust: '86–90', waist: '68–72', hips: '94–98' },
  { size: 'L', bust: '90–96', waist: '72–78', hips: '98–104' },
  { size: 'XL', bust: '96–102', waist: '78–84', hips: '104–110' },
  { size: 'XXL', bust: '102–108', waist: '84–90', hips: '110–116' },
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
      className="fixed inset-0 z-[80] bg-[#1A0A10]/70 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto animate-scale-in"
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

        <h3
          className="text-2xl mb-1 text-ink"
          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600 }}
        >
          Size Guide
        </h3>
        <p className="text-xs text-ink-500 mb-5" style={{ fontWeight: 300 }}>
          All measurements in centimetres.
        </p>

        <div className="rounded-xl border border-bone overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-burgundy text-white">
                <th
                  className="px-4 py-3 text-xs uppercase tracking-wider"
                  style={{ fontWeight: 500 }}
                >
                  Size
                </th>
                <th
                  className="px-4 py-3 text-xs uppercase tracking-wider"
                  style={{ fontWeight: 500 }}
                >
                  Bust
                </th>
                <th
                  className="px-4 py-3 text-xs uppercase tracking-wider"
                  style={{ fontWeight: 500 }}
                >
                  Waist
                </th>
                <th
                  className="px-4 py-3 text-xs uppercase tracking-wider"
                  style={{ fontWeight: 500 }}
                >
                  Hips
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr
                  key={r.size}
                  className={
                    i % 2 === 0
                      ? 'bg-white text-ink'
                      : 'bg-champagne text-ink'
                  }
                >
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ fontWeight: 500 }}
                  >
                    {r.size}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-500">{r.bust}</td>
                  <td className="px-4 py-3 text-sm text-ink-500">{r.waist}</td>
                  <td className="px-4 py-3 text-sm text-ink-500">{r.hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-ink-500 mt-5 leading-relaxed">
          Still unsure?{' '}
          <a
            href="https://wa.me/233599670944?text=Hi!%20I%27d%20like%20personal%20styling%20advice%20about%20sizing."
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0D6E4B]"
            style={{ fontWeight: 600 }}
          >
            Message us on WhatsApp
          </a>{' '}
          for personal styling advice.
        </p>
      </div>
    </div>,
    document.body,
  );
}

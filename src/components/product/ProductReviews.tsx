'use client';

import { useMemo, useState } from 'react';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  initials: string;
  verified: boolean;
  rating: number;
  date: string;
  body: string;
}

interface Props {
  productId: string;
  productName: string;
}

const SAMPLE_REVIEWS: Review[] = [
  {
    id: 'r1',
    name: 'Akosua D.',
    initials: 'AD',
    verified: true,
    rating: 5,
    date: 'March 2026',
    body:
      'Absolutely stunning. The fit was perfect — true to size. Comfortable from the moment I slipped them on. The packaging alone made it feel like a gift to myself.',
  },
  {
    id: 'r2',
    name: 'Naa K.',
    initials: 'NK',
    verified: true,
    rating: 5,
    date: 'February 2026',
    body:
      'Worth every cedi. Rahinatu was so helpful on WhatsApp — answered all my sizing questions before I bought. Quality far exceeded what I expected.',
  },
  {
    id: 'r3',
    name: 'Abena M.',
    initials: 'AM',
    verified: true,
    rating: 4,
    date: 'February 2026',
    body:
      'Beautiful piece. Roomier than expected which I loved. Stitching is clean and the hardware feels solid. Will be back for more.',
  },
  {
    id: 'r4',
    name: 'Esi O.',
    initials: 'EO',
    verified: true,
    rating: 5,
    date: 'January 2026',
    body:
      'Wore this to a wedding and got compliments all night. Detailing is even more striking in person. Picked up at KNUST same day.',
  },
];

export default function ProductReviews({ productId }: Props) {
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo(() => {
    const sum = productId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const total = 28 + (sum % 64);
    const avg = Number((4.6 + ((sum % 30) / 100)).toFixed(1));
    const dist = [
      Math.round(total * 0.78),
      Math.round(total * 0.16),
      Math.round(total * 0.04),
      Math.round(total * 0.015),
      Math.round(total * 0.005),
    ];
    return { total, avg, dist };
  }, [productId]);

  const reviews = expanded ? SAMPLE_REVIEWS : SAMPLE_REVIEWS.slice(0, 2);

  return (
    <section className="border-t border-bone pt-8 mt-8">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-ink-500 mb-1.5">Reviews</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-ink tabular-nums">{stats.avg}</span>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(stats.avg) ? 'fill-[#C9956C] text-[#C9956C]' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-xs text-ink-500">({stats.total})</span>
          </div>
        </div>
      </div>

      <ul className="space-y-5">
        {reviews.map((r) => (
          <li key={r.id} className="border border-bone rounded-2xl p-4 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-burgundy/10 text-burgundy text-xs font-bold flex items-center justify-center">
                  {r.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{r.name}</p>
                  <p className="text-[11px] text-ink-500">{r.date}{r.verified ? ' · Verified buyer' : ''}</p>
                </div>
              </div>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < r.rating ? 'fill-[#C9956C] text-[#C9956C]' : 'text-gray-300'}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-ink/80 leading-relaxed">{r.body}</p>
          </li>
        ))}
      </ul>

      {SAMPLE_REVIEWS.length > 2 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-5 text-[11px] font-bold uppercase tracking-widest text-burgundy hover:text-burgundy-dark transition-colors"
        >
          {expanded ? 'Show fewer reviews' : `Read all ${SAMPLE_REVIEWS.length} reviews`}
        </button>
      )}
    </section>
  );
}

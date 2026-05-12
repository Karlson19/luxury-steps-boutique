'use client';

import { useState, ReactNode } from 'react';
import {
  ChevronDown,
  BookOpen,
  Ruler,
  Sparkles,
  Droplets,
  Sun,
  Thermometer,
  Wind,
  Loader2,
} from 'lucide-react';
import { Product } from '@/types';

interface Props {
  product: Product;
}

interface ItemDef {
  id: string;
  Icon: typeof BookOpen;
  title: string;
  body: ReactNode;
}

// Care icons mapped to instruction index
const CARE_ICONS = [Droplets, Sun, Thermometer, Wind];

// Fallback care per category if the AI route fails or rate-limits.
const SHOE_CARE = { material: 'Premium upper',    care: ['Wipe clean with a dry cloth', 'Air dry away from heat', 'Condition leather regularly'] };
const BAG_CARE  = { material: 'Quality material', care: ['Spot clean only', 'Store stuffed to keep shape', 'Keep in the dust bag'] };

const FALLBACK_CARE: Record<string, { material: string; care: string[] }> = {
  heels:     SHOE_CARE,
  flats:     SHOE_CARE,
  handbags:  BAG_CARE,
  tote:      BAG_CARE,
  crossbody: BAG_CARE,
  mini:      BAG_CARE,
};

export default function ProductDetailsAccordion({ product }: Props) {
  const [open, setOpen] = useState<string | null>('description');
  const [careData, setCareData] = useState<{ material: string; care: string[] } | null>(null);
  const [careLoading, setCareLoading] = useState(false);
  const [careFetched, setCareFetched] = useState(false);

  const details = product.details ?? [];
  const hasSizes = product.sizes && product.sizes.length > 0;

  async function fetchCare() {
    if (careFetched) return;
    setCareFetched(true);
    setCareLoading(true);
    try {
      const res = await fetch('/api/generate-care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          category: product.category,
          details: product.details,
        }),
      });
      if (!res.ok) throw new Error('failed');
      const json = await res.json();
      setCareData(json);
    } catch {
      // Fall back to category defaults
      setCareData(FALLBACK_CARE[product.category] ?? FALLBACK_CARE.heels);
    } finally {
      setCareLoading(false);
    }
  }

  function handleOpen(id: string) {
    const next = open === id ? null : id;
    setOpen(next);
    if (next === 'care') fetchCare();
  }

  // Build accordion items dynamically
  const items: ItemDef[] = [];

  // 1. Description — always show if there's content
  if (product.description || details.length > 0) {
    items.push({
      id: 'description',
      Icon: BookOpen,
      title: 'Description',
      body: (
        <div>
          {product.description && (
            <p className="text-sm text-ink-500 leading-relaxed mb-3" style={{ fontWeight: 300 }}>
              {product.description}
            </p>
          )}
          {details.length > 0 && (
            <ul className="space-y-2">
              {details.map((d, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-ink-500 leading-relaxed"
                  style={{ fontWeight: 300 }}
                >
                  <span className="text-gold flex-shrink-0 mt-0.5">✦</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ),
    });
  }

  // 2. Size & Fit — only if product has sizes
  if (hasSizes) {
    items.push({
      id: 'fit',
      Icon: Ruler,
      title: 'Size & Fit',
      body: (
        <div className="space-y-3 text-sm text-ink-500 leading-relaxed" style={{ fontWeight: 300 }}>
          <p>
            Available sizes:{' '}
            <span className="text-ink" style={{ fontWeight: 500 }}>
              {product.sizes!.join(', ')}
            </span>
          </p>
          <a
            href="#size-selector"
            className="inline-block text-burgundy underline underline-offset-2 text-xs hover:text-burgundy-light transition-colors"
            style={{ fontWeight: 500 }}
          >
            View full size guide →
          </a>
        </div>
      ),
    });
  }

  // 3. Care & Materials — always show, AI-powered / Overridden by actual Material
  items.push({
    id: 'care',
    Icon: Sparkles,
    title: 'Care & Materials',
    body: careLoading ? (
      <div className="flex items-center gap-2 text-sm text-ink-500 py-2" style={{ fontWeight: 300 }}>
        <Loader2 className="w-4 h-4 animate-spin text-gold" />
        <span>Generating care guide...</span>
      </div>
    ) : careData ? (
      <div className="space-y-3 text-sm text-ink-500 leading-relaxed" style={{ fontWeight: 300 }}>
        <p>
          Material:{' '}
          <span className="text-ink" style={{ fontWeight: 500 }}>
            {product.material || careData.material} {/* ✨ Overrides with Admin DB if exists */}
          </span>
        </p>
        <ul className="space-y-2">
          {careData.care.map((instruction, i) => {
            const Icon = CARE_ICONS[i] ?? Droplets;
            return (
              <li key={i} className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-gold flex-shrink-0" strokeWidth={1.75} />
                <span>{instruction}</span>
              </li>
            );
          })}
        </ul>
      </div>
    ) : (
      <div className="text-sm text-ink-500 py-1" style={{ fontWeight: 300 }}>
        Loading care instructions...
      </div>
    ),
  });

  return (
    <section
      className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10 border-t border-bone"
      style={{ fontFamily: 'var(--font-jost)' }}
    >
      <h2
        className="text-2xl text-ink mb-6"
        style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600 }}
      >
        Product Details
      </h2>

      <div className="flex flex-col gap-3">
        {items.map(({ id, Icon, title, body }) => {
          const isOpen = open === id;
          return (
            <div
              key={id}
              className="bg-white rounded-2xl border border-bone overflow-hidden"
              style={{ boxShadow: '0 1px 4px rgba(123,29,46,0.07)' }}
            >
              <button
                onClick={() => handleOpen(id)}
                className="w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left cursor-pointer hover:bg-champagne transition-colors duration-150"
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gold" strokeWidth={1.75} />
                  <span
                    className="text-sm text-ink uppercase tracking-wide"
                    style={{ fontWeight: 600 }}
                  >
                    {title}
                  </span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-ink-500 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  strokeWidth={2}
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 sm:px-6 pb-5 pt-4 border-t border-bone">
                    {body}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

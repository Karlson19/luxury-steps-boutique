'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'heels', label: 'Heels' },
  { value: 'flats', label: 'Flats & Slippers' },
  { value: 'handbags', label: 'Handbags' },
  { value: 'tote', label: 'Tote Bags' },
  { value: 'crossbody', label: 'Crossbody' },
  { value: 'mini', label: 'Mini Bags' },
];

interface Props {
  selected: string;
  onChange?: (cat: string) => void;
  variant?: 'strip' | 'tabs';
}

export default function CategoryFilter({ selected, onChange, variant = 'strip' }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function select(cat: string) {
    if (onChange) { onChange(cat); return; }
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'all') { params.delete('category'); } else { params.set('category', cat); }
    router.push(`/products?${params.toString()}`);
  }

  const base = 'font-body text-[10px] font-semibold tracking-[0.18em] uppercase transition-colors duration-200 whitespace-nowrap pb-3 border-b-2 -mb-px';

  if (variant === 'tabs') {
    return (
      <div className="flex gap-6 lg:gap-8 overflow-x-auto scrollbar-hide border-b border-border">
        {CATEGORIES.map((c) => {
          const active = selected === c.value || (c.value === 'all' && !selected);
          return (
            <button key={c.value} onClick={() => select(c.value)}
              className={`${base} flex-shrink-0 ${active ? 'border-dark text-dark' : 'border-transparent text-muted hover:text-dark'}`}>
              {c.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex gap-6 overflow-x-auto scrollbar-hide">
      {CATEGORIES.map((c) => {
        const active = selected === c.value || (c.value === 'all' && !selected);
        return (
          <button key={c.value} onClick={() => select(c.value)}
            className={`flex-shrink-0 ${base} ${active ? 'border-dark text-dark' : 'border-transparent text-muted hover:text-dark'}`}>
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

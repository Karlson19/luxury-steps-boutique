'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const OPTIONS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function SortDropdown({ selected }: { selected?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) params.set('sort', e.target.value);
    else params.delete('sort');
    router.push(`/products?${params.toString()}`);
  }

  return (
    <select
      value={selected ?? ''}
      onChange={onChange}
      className="font-body text-sm border border-blush bg-surface text-dark rounded-full px-4 py-2 focus:outline-none focus:border-primary cursor-pointer"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

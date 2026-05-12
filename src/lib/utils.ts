import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function formatPrice(price: number): string {
  return `GHS ${price.toLocaleString('en-GH', { minimumFractionDigits: 0 })}`;
}

export function generateSlug(name: string): string {
  const base = slugify(name);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

// Canonical ascending order for clothing letter sizes — alphabetical sort
// would give "L M S XL XS XXL" which is wrong.
const LETTER_SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL'];

/**
 * Sort sizes ascending in a way that respects the kind of size it is.
 *  - All numeric  (shoe sizes: "36", "37.5", "40")  → numeric sort
 *  - All letters  (clothing: "XS","S","M","L","XL") → canonical letter order
 *  - Mixed/other                                    → natural-language sort
 */
export function sortSizes(sizes: string[]): string[] {
  if (sizes.length < 2) return sizes;

  const trimmed = sizes.map((s) => s.trim());
  const allNumeric = trimmed.every((s) => /^\d+(\.\d+)?$/.test(s));
  if (allNumeric) {
    return [...sizes].sort((a, b) => parseFloat(a) - parseFloat(b));
  }

  const allLetters = trimmed.every((s) => LETTER_SIZE_ORDER.includes(s.toUpperCase()));
  if (allLetters) {
    return [...sizes].sort(
      (a, b) => LETTER_SIZE_ORDER.indexOf(a.trim().toUpperCase()) - LETTER_SIZE_ORDER.indexOf(b.trim().toUpperCase()),
    );
  }

  return [...sizes].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

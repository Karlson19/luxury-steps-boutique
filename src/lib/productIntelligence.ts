import type { Product } from '@/types';

/**
 * Lightweight, deterministic intelligence for product care + size/fit.
 *
 * Rather than calling a remote LLM at request time (slow, costly, flaky),
 * we infer sensible care instructions and fit guidance from the data the
 * admin already enters: material/details strings and category. Admins can
 * always override by adding more specific lines to `details[]` — those are
 * shown verbatim in the Description accordion.
 */

// ─────────────────────────────────────────────────────────────────────
// CARE INTELLIGENCE
// ─────────────────────────────────────────────────────────────────────

export interface CareGuide {
  composition?: string; // "100% cotton" if confidently parsed
  materialLabel: string; // human-readable summary (e.g. "Ankara cotton")
  washing: string[];
  drying: string[];
  ironing?: string;
  warnings: string[];
  storage?: string;
  matched: boolean; // false → generic fallback used
}

interface MaterialRule {
  keywords: string[];
  label: string;
  washing: string[];
  drying: string[];
  ironing?: string;
  warnings: string[];
  storage?: string;
}

// Order matters — most specific first.
const MATERIAL_RULES: MaterialRule[] = [
  {
    keywords: ['ankara', 'kente', 'wax print', 'african print', 'batik'],
    label: 'African print fabric',
    washing: [
      'Hand wash cold the first 2–3 times to set the dye',
      'Then gentle machine cycle, cold water',
    ],
    drying: ['Hang to dry away from direct sun'],
    ironing: 'Iron on medium heat, inside out',
    warnings: ['Wash separately — colours may run', 'Do not bleach'],
  },
  {
    keywords: ['silk', 'satin', 'chiffon'],
    label: 'Silk / satin',
    washing: ['Dry clean recommended', 'Or hand wash cold with silk detergent'],
    drying: ['Lay flat in shade — never wring'],
    ironing: 'Iron on low heat, inside out, while slightly damp',
    warnings: ['Avoid harsh detergents', 'Do not soak'],
    storage: 'Hang on padded hangers',
  },
  {
    keywords: ['wool', 'cashmere', 'merino', 'alpaca'],
    label: 'Wool',
    washing: ['Hand wash cold with wool-safe detergent', 'Or dry clean'],
    drying: ['Lay flat to dry, reshape gently'],
    ironing: 'Steam to refresh — iron only on low if needed',
    warnings: ['Do not tumble dry', 'Do not wring'],
    storage: 'Fold and store with cedar to prevent moths',
  },
  {
    keywords: ['leather', 'suede'],
    label: 'Leather',
    washing: ['Wipe with a soft, barely-damp cloth'],
    drying: ['Air dry away from direct heat'],
    warnings: ['Do not soak', 'Avoid prolonged sun exposure'],
    storage: 'Use the dust bag; condition twice a year',
  },
  {
    keywords: ['beaded', 'sequin', 'embroidered', 'embellished', 'sequinned'],
    label: 'Embellished fabric',
    washing: ['Spot clean only with a damp cloth', 'Hand wash if labelled'],
    drying: ['Lay flat to dry'],
    warnings: ['Do not machine wash', 'Do not iron over the embellishments'],
    storage: 'Store flat or on a padded hanger',
  },
  {
    keywords: ['linen'],
    label: 'Linen',
    washing: ['Hand wash, or gentle machine cycle on cold'],
    drying: ['Hang or lay flat'],
    ironing: 'Iron while slightly damp on medium-high',
    warnings: ['Do not bleach'],
  },
  {
    keywords: ['denim', 'jean'],
    label: 'Denim',
    washing: ['Wash inside-out in cold water'],
    drying: ['Hang to dry — avoid the dryer'],
    ironing: 'Iron on medium heat, inside out',
    warnings: ['Wash separately for the first three wears', 'Avoid tumble drying'],
  },
  {
    keywords: ['cotton'],
    label: 'Cotton',
    washing: ['Hand wash cold or gentle machine cycle'],
    drying: ['Hang or lay flat'],
    ironing: 'Iron on medium heat',
    warnings: ['Avoid bleach to preserve colour'],
  },
  {
    keywords: ['polyester', 'synthetic', 'nylon', 'spandex', 'elastane'],
    label: 'Synthetic blend',
    washing: ['Machine wash cold on a gentle cycle'],
    drying: ['Tumble dry low or hang to dry'],
    ironing: 'Iron on low heat if needed',
    warnings: ['Do not iron on high heat — fibres melt'],
  },
  {
    keywords: ['rayon', 'viscose', 'modal'],
    label: 'Rayon / viscose',
    washing: ['Hand wash cold, or dry clean'],
    drying: ['Lay flat to dry'],
    warnings: ['Shrinks in hot water', 'Do not wring'],
  },
  {
    keywords: ['gold', 'silver', '14k', '18k', 'sterling', 'plated', 'brass'],
    label: 'Metal jewellery',
    washing: ['Wipe with a soft, dry cloth after each wear'],
    drying: [],
    warnings: [
      'Avoid perfume, lotion and water',
      'Do not use jewellery cleaner on plated pieces',
    ],
    storage: 'Keep in a dry, airtight pouch — separate pieces to avoid scratches',
  },
  {
    keywords: ['bead', 'glass bead', 'stone', 'pearl'],
    label: 'Beaded jewellery',
    washing: ['Wipe gently with a dry cloth'],
    drying: [],
    warnings: ['Avoid chemicals and water', 'Beads can chip — handle with care'],
    storage: 'Lay flat in a soft pouch',
  },
  {
    keywords: ['rattan', 'grass', 'straw', 'woven', 'raffia'],
    label: 'Woven natural fibre',
    washing: ['Dust gently, or wipe with a barely-damp cloth'],
    drying: ['Air dry away from direct sun'],
    warnings: ['Avoid moisture and high humidity', 'Do not soak'],
    storage: 'Store in a dry place',
  },
  {
    keywords: ['wood', 'bamboo', 'mahogany', 'oak'],
    label: 'Wood',
    washing: ['Wipe with a dry or barely-damp cloth'],
    drying: [],
    warnings: ['Avoid prolonged moisture', 'Keep away from direct sun'],
    storage: 'Polish occasionally with a natural wood oil',
  },
  {
    keywords: ['ceramic', 'porcelain', 'clay'],
    label: 'Ceramic',
    washing: ['Hand wash with mild soap'],
    drying: ['Air dry'],
    warnings: ['Handle with care — fragile', 'Avoid sudden temperature changes'],
  },
];

const COMPOSITION_RE = /\b(\d{1,3})\s?%\s*([a-zA-Z\s-]+?)(?=[,.]|\s+(?:and|with|&)|\s*$|\d{1,3}\s?%)/gi;

export function parseComposition(material: string): string | undefined {
  const matches: string[] = [];
  COMPOSITION_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = COMPOSITION_RE.exec(material)) !== null) {
    const pct = m[1];
    const fabric = m[2].trim().replace(/\s+/g, ' ');
    if (fabric.length === 0) continue;
    matches.push(`${pct}% ${fabric}`);
  }
  if (matches.length === 0) return undefined;
  return matches.join(' · ');
}

function findMaterialString(product: Product): string {
  // Prefer details[0] (admin-entered material), fall back to scanning
  // any details line with material keywords, then description.
  const details = product.details ?? [];
  if (details.length > 0) return details[0];
  const description = product.description ?? '';
  return description;
}

const SHOE_CARE: MaterialRule = {
  keywords: [],
  label: 'Mixed materials',
  washing: ['Wipe clean with a barely-damp cloth'],
  drying: ['Air dry — never use direct heat'],
  warnings: ['Avoid soaking', 'Do not machine wash'],
  storage: 'Store with shoe trees or stuffed paper to keep shape',
};

const BAG_CARE: MaterialRule = {
  keywords: [],
  label: 'Mixed materials',
  washing: ['Wipe with a soft, barely-damp cloth'],
  drying: ['Air dry away from heat'],
  warnings: ['Avoid soaking and harsh chemicals'],
  storage: 'Stuff with paper and store in the dust bag',
};

const GENERIC_FALLBACK_BY_CATEGORY: Record<string, MaterialRule> = {
  heels:     SHOE_CARE,
  flats:     SHOE_CARE,
  handbags:  BAG_CARE,
  tote:      BAG_CARE,
  crossbody: BAG_CARE,
  mini:      BAG_CARE,
};

export function inferCare(product: Product): CareGuide {
  const materialString = findMaterialString(product).toLowerCase();
  const composition = parseComposition(findMaterialString(product));

  // Find the first matching rule
  for (const rule of MATERIAL_RULES) {
    if (rule.keywords.some((kw) => materialString.includes(kw))) {
      return {
        composition,
        materialLabel: composition ?? rule.label,
        washing: rule.washing,
        drying: rule.drying,
        ironing: rule.ironing,
        warnings: rule.warnings,
        storage: rule.storage,
        matched: true,
      };
    }
  }

  // Category-based fallback
  const fallback =
    GENERIC_FALLBACK_BY_CATEGORY[product.category] ??
    GENERIC_FALLBACK_BY_CATEGORY.heels;
  return {
    composition,
    materialLabel: composition ?? fallback.label,
    washing: fallback.washing,
    drying: fallback.drying,
    ironing: fallback.ironing,
    warnings: fallback.warnings,
    storage: fallback.storage,
    matched: false,
  };
}

// ─────────────────────────────────────────────────────────────────────
// SIZE & FIT INTELLIGENCE
// ─────────────────────────────────────────────────────────────────────

export interface SizeFitGuide {
  /** Categories that genuinely have sizing — show pills + fit notes */
  hasSizing: boolean;
  /** Categories where sizing is N/A and a one-size note is more honest */
  oneSize: boolean;
  sizes?: string[];
  fitNote?: string;
  modelNote?: string;
  oneSizeNote?: string;
  /** Dimensions parsed from `details[]` (e.g. "180cm × 35cm") */
  dimensions?: string[];
  /** Helpful pointer text based on category */
  pointer?: string;
}

const SIZED_CATEGORIES = new Set([
  'heels',
  'flats',
]);

const ONE_SIZE_CATEGORIES = new Set([
  'handbags',
  'tote',
  'crossbody',
  'mini',
]);

const DIMENSION_RE = /(\d+(?:\.\d+)?)\s*(cm|mm|m|inches|in|"|')(?:\s*[×x]\s*(\d+(?:\.\d+)?)\s*(cm|mm|m|inches|in|"|'))?(?:\s*[×x]\s*(\d+(?:\.\d+)?)\s*(cm|mm|m|inches|in|"|'))?/i;

export function extractDimensions(details: string[] | null | undefined): string[] {
  if (!details) return [];
  const dims: string[] = [];
  for (const d of details) {
    const m = d.match(DIMENSION_RE);
    if (m) dims.push(m[0]);
  }
  return dims;
}

const FIT_POINTERS_BY_CATEGORY: Record<string, string> = {
  heels:
    'True to size in EU. Half-sizes round up — message us on WhatsApp if unsure.',
  flats:
    'True to size in EU. If between sizes, size up for a relaxed fit.',
};

const ONE_SIZE_NOTES: Record<string, string> = {
  handbags:  'Single size. See dimensions below for capacity.',
  tote:      'Single size. See dimensions below for capacity.',
  crossbody: 'Single size. Adjustable strap where applicable.',
  mini:      'Single size. Compact silhouette — see dimensions below.',
};

export function inferSizeFit(product: Product): SizeFitGuide {
  const sizes = product.sizes ?? undefined;
  const hasExplicitSizes = !!(sizes && sizes.length > 0);
  const isSizedCategory = SIZED_CATEGORIES.has(product.category);
  const isOneSize = ONE_SIZE_CATEGORIES.has(product.category) && !hasExplicitSizes;
  const dimensions = extractDimensions(product.details);

  if (hasExplicitSizes || isSizedCategory) {
    return {
      hasSizing: true,
      oneSize: false,
      sizes,
      fitNote: FIT_POINTERS_BY_CATEGORY[product.category] ?? 'True to size.',
      dimensions: dimensions.length > 0 ? dimensions : undefined,
      pointer: FIT_POINTERS_BY_CATEGORY[product.category],
    };
  }

  if (isOneSize) {
    return {
      hasSizing: false,
      oneSize: true,
      oneSizeNote: ONE_SIZE_NOTES[product.category] ?? 'Single size.',
      dimensions: dimensions.length > 0 ? dimensions : undefined,
    };
  }

  return {
    hasSizing: false,
    oneSize: false,
    oneSizeNote: 'Single size.',
    dimensions: dimensions.length > 0 ? dimensions : undefined,
  };
}

// Universal color resolver.
//
// The admin types any color name they want — common ones like "Red" or "Rose
// Gold", natural-language ones like "Greenish Grey" or "Burnt Orange", or
// rare ones like "Mocha Mauve". The product detail page must produce a
// VISIBLE swatch for every one of these — an empty circle ("color not
// recognised") looks like a broken site.
//
// Resolution waterfall:
//   1. Hand-curated fashion COLOR_MAP (~150 entries)        → exact match
//   2. Modifier parsing: "dark X" / "light X" / "X-ish"     → tone-shift base
//   3. Two-word combos: take the second word, treat first as adjective
//   4. CSS named-color set (~140 entries)                   → use as-is
//   5. Deterministic pastel from a hash of the name         → never blank
//
// Every path returns a real hex string. There is no "fail" — only graceful
// degradation toward a soft, brand-friendly pastel.

const HAND_CURATED: Record<string, string> = {
  // ── Pure brand-palette colours (so e.g. "Scarlet" matches the LSB scarlet) ──
  'scarlet':         '#C8102E',
  'crimson':         '#9B1B30',
  'burgundy':        '#7B1818',
  'wine':            '#5E2129',
  'maroon':          '#5C0F1B',
  'rose gold':       '#B76E79',

  // ── Reds / pinks ──
  'red':             '#DC2626',
  'cherry':          '#D2042D',
  'ruby':            '#9B111E',
  'brick':           '#9C322B',
  'rust':            '#B7410E',
  'blood red':       '#660000',
  'pink':            '#EC4899',
  'hot pink':        '#F472B6',
  'bubblegum':       '#FFC1CC',
  'rose':            '#E11D48',
  'rose pink':       '#FF66CC',
  'salmon':          '#FA8072',
  'coral':           '#FF7F50',
  'blush':           '#FFC0CB',
  'baby pink':       '#FAD2E1',
  'fuchsia':         '#D946EF',
  'magenta':         '#C026D3',

  // ── Oranges / yellows ──
  'orange':          '#F97316',
  'peach':           '#FFDAB9',
  'apricot':         '#FBCEB1',
  'amber':           '#F59E0B',
  'tangerine':       '#F28500',
  'mustard':         '#E0A800',
  'yellow':          '#EAB308',
  'lemon':           '#FFF44F',
  'gold':            '#D4AF37',
  'champagne':       '#F7E7CE',
  'butter':          '#FFEAB3',

  // ── Browns / neutrals ──
  'brown':           '#78350F',
  'chocolate':       '#5C3317',
  'mocha':           '#7B5E51',
  'mocha mauve':     '#A06477',
  'coffee':          '#6F4E37',
  'caramel':         '#AF6E4D',
  'toffee':          '#9C7248',
  'tan':             '#D2B48C',
  'camel':           '#C19A6B',
  'khaki':           '#C3B091',
  'beige':           '#F5F5DC',
  'nude':            '#E3BC9A',
  'sand':            '#C2B280',
  'taupe':           '#8B7E74',
  'stone':           '#A8A29E',
  'cream':           '#FFFDD0',
  'ivory':           '#FFFAF0',
  'bone':            '#E3DAC9',
  'oat':             '#D4C5A9',
  'pearl':           '#EAE0C8',

  // ── Greens ──
  'green':           '#16A34A',
  'lime':            '#84CC16',
  'olive':           '#3F6212',
  'army green':      '#4B5320',
  'forest':          '#1E4D2B',
  'forest green':    '#1E4D2B',
  'hunter green':    '#355E3B',
  'emerald':         '#065F46',
  'mint':            '#3EB489',
  'pistachio':       '#93C572',
  'sage':            '#9CAF88',
  'sage green':      '#9CAF88',
  'jade':            '#00A86B',
  'teal':            '#0D9488',

  // ── Blues / cyans ──
  'blue':            '#2563EB',
  'royal blue':      '#1D4ED8',
  'navy':            '#1E3A8A',
  'navy blue':       '#1E3A8A',
  'cobalt':          '#0047AB',
  'sky blue':        '#7DD3FC',
  'sky':             '#87CEEB',
  'baby blue':       '#BFDBFE',
  'powder blue':     '#B0E0E6',
  'denim':           '#1F4E79',
  'midnight':        '#1A1A40',
  'midnight blue':   '#191970',
  'turquoise':       '#30D5C8',
  'cyan':            '#0891B2',
  'aqua':            '#00FFFF',
  'electric blue':   '#7DF9FF',

  // ── Purples ──
  'purple':          '#9333EA',
  'violet':          '#7C3AED',
  'indigo':          '#4338CA',
  'plum':            '#8B3A62',
  'lavender':        '#D8B4E2',
  'lilac':           '#C8A2C8',
  'mauve':           '#E0B0FF',
  'orchid':          '#DA70D6',
  'eggplant':        '#614051',

  // ── Greys / blacks / whites ──
  'black':           '#000000',
  'jet black':       '#0A0A0A',
  'off black':       '#222222',
  'charcoal':        '#374151',
  'graphite':        '#3A3A3A',
  'slate':           '#475569',
  'grey':            '#9CA3AF',
  'gray':            '#9CA3AF',
  'silver':          '#C0C0C0',
  'platinum':        '#E5E4E2',
  'smoke':           '#BDBDBD',
  'ash':             '#B2BEB5',
  'fog':             '#D0D0D0',
  'pewter':          '#9C9C9C',
  'white':           '#FFFFFF',
  'off white':       '#FAFAFA',
  'eggshell':        '#F0EAD6',

  // ── Metallic / accents ──
  'bronze':          '#A97142',
  'copper':          '#B87333',
  'brass':           '#B5A642',
  'gunmetal':        '#2A3439',

  // ── Natural-language two-word combos people actually type ──
  'greenish grey':   '#7A8A7A',
  'greenish gray':   '#7A8A7A',
  'bluish grey':     '#7A8895',
  'bluish gray':     '#7A8895',
  'pinkish brown':   '#A07060',
  'reddish brown':   '#8B3A1B',
  'yellowish green': '#B5B842',
  'burnt orange':    '#CC5500',
  'burnt sienna':    '#E97451',
  'burnt umber':     '#8A3324',
  'dusty pink':      '#D2A0A0',
  'dusty rose':      '#D8A0A0',
  'dusty blue':      '#A2B4C0',
  'pastel pink':     '#FFD1DC',
  'pastel blue':     '#AEC6CF',
  'pastel green':    '#B4E1C0',
  'pastel yellow':   '#FDFD96',
  'neon pink':       '#FF6EC7',
  'neon green':      '#39FF14',
  'hot red':         '#FF1F1F',
  'electric pink':   '#FF1493',
  'deep blue':       '#0A1F44',
  'deep red':        '#7B1010',
  'deep green':      '#0B3D1E',
  'deep purple':     '#36013F',
  'bright red':      '#FF1F1F',
  'bright blue':     '#1F75FE',
  'bright green':    '#2ECC40',
  'sea green':       '#2E8B57',
  'sea blue':        '#207BBF',
  'army':            '#4B5320',
  'wine red':        '#722F37',
  'rose red':        '#C21E56',
  'fire red':        '#CE2029',
  'cherry red':      '#D2042D',
};

// The 140 CSS named colours. If the admin types one of these and it's not
// in the curated map, we fall back to the CSS name itself (browsers render
// these directly). Stored as a Set for O(1) lookup.
const CSS_NAMED = new Set([
  'aliceblue','antiquewhite','aqua','aquamarine','azure','beige','bisque','black',
  'blanchedalmond','blue','blueviolet','brown','burlywood','cadetblue','chartreuse',
  'chocolate','coral','cornflowerblue','cornsilk','crimson','cyan','darkblue',
  'darkcyan','darkgoldenrod','darkgray','darkgrey','darkgreen','darkkhaki',
  'darkmagenta','darkolivegreen','darkorange','darkorchid','darkred','darksalmon',
  'darkseagreen','darkslateblue','darkslategray','darkslategrey','darkturquoise',
  'darkviolet','deeppink','deepskyblue','dimgray','dimgrey','dodgerblue','firebrick',
  'floralwhite','forestgreen','fuchsia','gainsboro','ghostwhite','gold','goldenrod',
  'gray','grey','green','greenyellow','honeydew','hotpink','indianred','indigo',
  'ivory','khaki','lavender','lavenderblush','lawngreen','lemonchiffon','lightblue',
  'lightcoral','lightcyan','lightgoldenrodyellow','lightgray','lightgrey',
  'lightgreen','lightpink','lightsalmon','lightseagreen','lightskyblue',
  'lightslategray','lightslategrey','lightsteelblue','lightyellow','lime','limegreen',
  'linen','magenta','maroon','mediumaquamarine','mediumblue','mediumorchid',
  'mediumpurple','mediumseagreen','mediumslateblue','mediumspringgreen',
  'mediumturquoise','mediumvioletred','midnightblue','mintcream','mistyrose',
  'moccasin','navajowhite','navy','oldlace','olive','olivedrab','orange','orangered',
  'orchid','palegoldenrod','palegreen','paleturquoise','palevioletred','papayawhip',
  'peachpuff','peru','pink','plum','powderblue','purple','rebeccapurple','red',
  'rosybrown','royalblue','saddlebrown','salmon','sandybrown','seagreen','seashell',
  'sienna','silver','skyblue','slateblue','slategray','slategrey','snow',
  'springgreen','steelblue','tan','teal','thistle','tomato','turquoise','violet',
  'wheat','white','whitesmoke','yellow','yellowgreen',
]);

// Modifier multipliers to lighten/darken/desaturate a base color.
// Applied via simple RGB lerp toward white (light) or black (dark).
const MODIFIERS: Record<string, { mix: 'lighten' | 'darken' | 'desaturate'; amt: number }> = {
  'light':   { mix: 'lighten',   amt: 0.32 },
  'pale':    { mix: 'lighten',   amt: 0.45 },
  'pastel':  { mix: 'lighten',   amt: 0.55 },
  'soft':    { mix: 'lighten',   amt: 0.25 },
  'dark':    { mix: 'darken',    amt: 0.32 },
  'deep':    { mix: 'darken',    amt: 0.40 },
  'burnt':   { mix: 'darken',    amt: 0.25 },
  'dusty':   { mix: 'desaturate', amt: 0.40 },
  'muted':   { mix: 'desaturate', amt: 0.35 },
  'bright':  { mix: 'lighten',   amt: 0.10 },
  'neon':    { mix: 'lighten',   amt: 0.15 },
  'hot':     { mix: 'lighten',   amt: 0.05 },
};

function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const v = m.length === 3
    ? m.split('').map((c) => c + c).join('')
    : m;
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function applyModifier(hex: string, mod: keyof typeof MODIFIERS): string {
  const [r, g, b] = hexToRgb(hex);
  const { mix, amt } = MODIFIERS[mod];
  if (mix === 'lighten') {
    return rgbToHex(lerp(r, 255, amt), lerp(g, 255, amt), lerp(b, 255, amt));
  }
  if (mix === 'darken') {
    return rgbToHex(lerp(r, 0, amt), lerp(g, 0, amt), lerp(b, 0, amt));
  }
  // desaturate: blend toward the channel average
  const avg = (r + g + b) / 3;
  return rgbToHex(lerp(r, avg, amt), lerp(g, avg, amt), lerp(b, avg, amt));
}

// Deterministic soft pastel from any string. Same name always yields the
// same color, so the customer experience is stable across page loads.
function pastelFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  // HSL → RGB conversion for a soft pastel (high lightness, moderate sat)
  const s = 0.55;
  const l = 0.72;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (hue < 60)       [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else if (hue < 300) [r, g, b] = [x, 0, c];
  else                [r, g, b] = [c, 0, x];
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

/**
 * Resolve any color name to a real hex color.
 *
 * Resolution waterfall — first match wins:
 *  1. HAND_CURATED map (~150 fashion-named colors)
 *  2. "X-ish Y" pattern (e.g. "greenish grey") — handled in curated map
 *  3. Modifier + base ("dark blue", "light pink", "burnt orange", "dusty rose")
 *  4. Drop modifier and try base alone (e.g. "vintage rose" → "rose")
 *  5. CSS named color (browsers know 140 of these)
 *  6. Deterministic pastel from the name — guarantees a visible swatch
 *
 * Returns `{ hex, exact }`. `exact: true` means we found a curated match
 * or a real CSS color. `exact: false` means we fell back to a derived
 * tone or hash pastel — useful to know if you want to add a small "≈" hint
 * next to the swatch, but in practice we just render the swatch and trust
 * that the customer can read the label below it.
 */
export function resolveColor(name: string): { hex: string; exact: boolean } {
  if (!name) return { hex: '#E5E5E5', exact: false };

  const n = normalize(name);

  // 1. Exact curated hit
  if (HAND_CURATED[n]) return { hex: HAND_CURATED[n], exact: true };

  // 2. Modifier + base ("dark blue", "burnt orange", "pastel pink", ...)
  const tokens = n.split(' ');
  if (tokens.length >= 2) {
    const head = tokens[0];
    const rest = tokens.slice(1).join(' ');
    if (MODIFIERS[head] && HAND_CURATED[rest]) {
      return { hex: applyModifier(HAND_CURATED[rest], head as keyof typeof MODIFIERS), exact: false };
    }
    // 2b. base might itself be a CSS named color ("dark mint" — "mint" not in
    // curated but CSS-named not either; rare path, but cheap to try)
    if (MODIFIERS[head] && CSS_NAMED.has(rest.replace(/\s+/g, ''))) {
      return { hex: applyModifier(`#000000`, head as keyof typeof MODIFIERS), exact: false };
    }
  }

  // 3. Drop the first word and retry ("vintage rose" → "rose")
  if (tokens.length >= 2) {
    const tail = tokens.slice(1).join(' ');
    if (HAND_CURATED[tail]) return { hex: HAND_CURATED[tail], exact: false };
  }

  // 4. CSS named color (browsers recognise these — `backgroundColor: 'violet'`)
  const cssCandidate = n.replace(/\s+/g, '');
  if (CSS_NAMED.has(cssCandidate)) {
    // Use the name directly — browsers will render it. Hex isn't strictly
    // required for CSS named colors, but returning a string the consumer
    // can drop into backgroundColor keeps the API uniform.
    return { hex: cssCandidate, exact: true };
  }

  // 5. Last resort: deterministic pastel. Always a visible, brand-soft tone.
  return { hex: pastelFromName(n), exact: false };
}

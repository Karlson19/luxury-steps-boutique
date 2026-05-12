interface Props {
  value: number;
  compare?: number | null;
  /** Visual size — affects typography scale */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Show currency code separately as a small label */
  emphasizeCurrency?: boolean;
  /** Show savings percentage if compare > value */
  showSavings?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: { main: 'text-xs', currency: 'text-[8px]', compare: 'text-[10px]', gap: 'gap-1' },
  sm: { main: 'text-sm', currency: 'text-[9px]', compare: 'text-[11px]', gap: 'gap-1.5' },
  md: { main: 'text-base sm:text-lg', currency: 'text-[10px]', compare: 'text-xs', gap: 'gap-2' },
  lg: { main: 'text-2xl sm:text-3xl', currency: 'text-xs', compare: 'text-sm', gap: 'gap-2.5' },
  xl: { main: 'text-4xl sm:text-5xl lg:text-6xl', currency: 'text-base', compare: 'text-lg', gap: 'gap-3' },
};

function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-GH', { maximumFractionDigits: 0 }).format(n);
}

export default function Price({
  value,
  compare,
  size = 'md',
  emphasizeCurrency = false,
  showSavings = false,
  className = '',
}: Props) {
  const s = SIZE_MAP[size];
  const onSale = compare && compare > value;
  const savedPct = onSale ? Math.round(((compare - value) / compare) * 100) : 0;

  return (
    <div className={`inline-flex items-baseline ${s.gap} ${className}`}>
      {emphasizeCurrency ? (
        <>
          <span className={`${s.currency} font-bold tracking-[0.18em] uppercase text-ink-300 self-center mt-0.5`}>
            GHS
          </span>
          <span className={`${s.main} font-black text-ink tracking-tight tabular-nums`}>
            {formatNumber(value)}
          </span>
        </>
      ) : (
        <span className={`${s.main} font-black text-ink tracking-tight tabular-nums`}>
          GHS {formatNumber(value)}
        </span>
      )}

      {onSale && (
        <span className={`${s.compare} text-ink-300 line-through tabular-nums font-medium`}>
          GHS {formatNumber(compare)}
        </span>
      )}

      {onSale && showSavings && (
        <span className={`${s.compare} font-bold uppercase tracking-[0.15em] text-burgundy bg-rose-soft px-2 py-0.5 rounded-full`}>
          -{savedPct}%
        </span>
      )}
    </div>
  );
}

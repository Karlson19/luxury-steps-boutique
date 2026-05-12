'use client';

import { useEffect, useState, useRef } from 'react';

interface Props {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/** Animates a number from 0 → value when scrolled into view (or on mount) */
export default function Counter({ value, duration = 1200, prefix = '', suffix = '', className = '' }: Props) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const start = performance.now();
          const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            setDisplay(Math.round(value * easeOut(t)));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration]);

  // Re-animate if value changes after first render
  useEffect(() => {
    if (!startedRef.current) return;
    const start = performance.now();
    const from = display;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / Math.min(duration, 700));
      setDisplay(Math.round(from + (value - from) * easeOut(t)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'fade';

interface Props {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: Direction;
  distance?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
  /**
   * Stagger value (0-N) → applies an automatic delay so siblings reveal in sequence
   * without specifying delays manually. delay = stagger * 80ms
   */
  stagger?: number;
  /**
   * Render as the given HTML tag (defaults to div)
   */
  as?: keyof JSX.IntrinsicElements;
}

const TRANSFORMS: Record<Direction, { from: string; to: string }> = {
  up: { from: 'translate3d(0, 32px, 0)', to: 'translate3d(0, 0, 0)' },
  down: { from: 'translate3d(0, -24px, 0)', to: 'translate3d(0, 0, 0)' },
  left: { from: 'translate3d(32px, 0, 0)', to: 'translate3d(0, 0, 0)' },
  right: { from: 'translate3d(-32px, 0, 0)', to: 'translate3d(0, 0, 0)' },
  fade: { from: 'translate3d(0, 0, 0)', to: 'translate3d(0, 0, 0)' },
};

export default function Reveal({
  children,
  delay = 0,
  duration = 900,
  direction = 'up',
  className = '',
  threshold = 0.15,
  once = true,
  stagger,
  as = 'div',
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced-motion users
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) obs.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -10% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, once]);

  const t = TRANSFORMS[direction];
  const computedDelay = (stagger !== undefined ? stagger * 80 : delay);

  const Tag = as as 'div';
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? t.to : t.from,
        transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${computedDelay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${computedDelay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </Tag>
  );
}

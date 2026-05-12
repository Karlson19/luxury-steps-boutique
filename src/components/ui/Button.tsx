'use client';

import Link from 'next/link';
import { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'accent' | 'dark' | 'whatsapp';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-gray-900 via-[#C8102E] to-gray-900 bg-[length:200%_100%] hover:bg-[100%_0] text-white shadow-lux-2 hover:shadow-lux-3',
  secondary:
    'bg-white text-gray-900 border border-gray-200 hover:border-gray-900 hover:bg-gray-50 shadow-lux-1 hover:shadow-lux-2',
  ghost:
    'bg-transparent text-gray-900 hover:bg-gray-100',
  outline:
    'bg-transparent text-white border border-white/30 hover:border-white hover:bg-white/5',
  accent:
    'bg-amber-500 text-gray-900 hover:bg-amber-400 shadow-lux-2 hover:shadow-lux-3',
  dark:
    'bg-gray-900 text-white hover:bg-[#C8102E] shadow-lux-1 hover:shadow-lux-2',
  whatsapp:
    'bg-green-50 text-green-700 border border-green-100 hover:bg-green-500 hover:text-white hover:border-green-500',
};

const SIZES: Record<Size, string> = {
  sm: 'text-[10px] tracking-[0.18em] px-4 py-2.5',
  md: 'text-[11px] tracking-[0.18em] px-6 py-3.5',
  lg: 'text-xs tracking-[0.2em] px-8 py-4',
  xl: 'text-sm tracking-[0.2em] px-10 py-4.5',
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children: ReactNode;
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type Props = ButtonProps | LinkProps;

const baseClass =
  'inline-flex items-center justify-center gap-2 font-bold uppercase rounded-full transition-all duration-500 ease-lux active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed select-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C8102E]/20 cursor-pointer';

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>(function Button(
  { variant = 'dark', size = 'md', fullWidth, loading, iconLeft, iconRight, children, className = '', ...rest },
  ref
) {
  const cls = `${baseClass} ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  const content = (
    <>
      {loading ? (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : iconLeft}
      <span>{children}</span>
      {iconRight}
    </>
  );

  if ('href' in rest && rest.href) {
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={cls}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={cls}
      disabled={loading || (rest as ButtonHTMLAttributes<HTMLButtonElement>).disabled}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
});

export default Button;

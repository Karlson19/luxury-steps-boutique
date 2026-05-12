import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        card: '0 4px 24px rgba(200, 16, 46, 0.07)',
        'card-hover': '0 10px 36px rgba(200, 16, 46, 0.14)',
        soft: '0 2px 12px rgba(0,0,0,0.06)',
        'soft-hover': '0 6px 24px rgba(0,0,0,0.12)',
        // Refined luxury shadows
        'lux-1': '0 1px 2px rgba(15,15,20,0.04), 0 2px 8px rgba(15,15,20,0.04)',
        'lux-2': '0 4px 16px rgba(15,15,20,0.06), 0 12px 40px rgba(15,15,20,0.06)',
        'lux-3': '0 16px 48px rgba(15,15,20,0.08), 0 32px 80px rgba(15,15,20,0.10)',
      },
      transitionTimingFunction: {
        'lux': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'lux-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'lux-in': 'cubic-bezier(0.7, 0, 0.84, 0)',
      },
      letterSpacing: {
        'tightest': '-0.04em',
        'editorial': '-0.025em',
      },
      colors: {
        // ── LEGACY (kept for back-compat with existing components) ──
        primary: '#C8102E',          // Scarlet Red
        'primary-dark': '#7B1818',    // Deep Ruby
        accent: '#C9956C',            // Rose Gold
        cream: '#FFFAF8',             // Ivory
        dark: '#1A0A0A',
        charcoal: '#2A1414',
        muted: '#8C7574',
        'muted-light': '#C9AFAE',
        success: '#16A34A',
        surface: '#FFFFFF',
        border: '#F5DDD9',
        blush: '#FFF0EE',
        // ── LUXURY STEPS BOUTIQUE PALETTE ──
        // Tailwind keys retained from the previous theme so existing class names
        // keep working — values fully retuned to the new scarlet / ruby / rose-gold palette.
        champagne: {
          DEFAULT: '#FFFAF8', // page background — Ivory
          50: '#FFFCFB',
          100: '#FFF5F2',
          200: '#FFE9E4',
          300: '#FFD7CF',
        },
        bone: '#FFE0DA',     // warm border / section bg
        ink: {
          DEFAULT: '#1A0A0A', // warm near-black
          900: '#1A0A0A',
          700: '#3D1010',
          500: '#7A5050',     // muted text
          300: '#A88080',
        },
        burgundy: {
          DEFAULT: '#C8102E',   // Scarlet Red (was burgundy)
          dark: '#7B1818',      // Deep Ruby
          light: '#E63950',
        },
        plum: '#7B1818',         // Deep Ruby
        gold: {
          DEFAULT: '#C9956C',   // Rose Gold (was gold)
          light: '#DCB089',
          dark: '#A87850',
        },
        rose: {
          soft: '#FFF0EE',      // Blush
          mid:  '#FFE0DA',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body: ['var(--font-jost)', 'system-ui', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 35s linear infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

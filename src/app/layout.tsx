import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';
import ToastContainer from '@/components/ui/Toast';
import InstallAppBanner from '@/components/ui/InstallAppBanner';
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

// ✨ NEW: Locks the viewport scaling so it feels like a native app, and sets the top bar color
export const viewport: Viewport = {
  themeColor: '#7B1818',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Luxury Steps Boutique | Premium Shoes & Bags · Ghana',
  description:
    'Premium heels, flats, handbags and clutches — curated by Rahinatu in Ghana. Delivered nationwide via WhatsApp.',
  metadataBase: new URL(getSiteUrl()),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Luxury Steps',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Luxury Steps Boutique | Premium Shoes & Bags · Ghana',
    description: 'Premium heels, flats, handbags and clutches — curated by Rahinatu in Ghana.',
    siteName: 'Luxury Steps Boutique',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Luxury Steps Boutique | Premium Shoes & Bags · Ghana' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luxury Steps Boutique | Premium Shoes & Bags · Ghana',
    description: 'Premium heels, flats, handbags and clutches — curated by Rahinatu in Ghana.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="bg-cream font-body text-dark antialiased">
        {children}
        <ToastContainer />
        <InstallAppBanner />
      </body>
    </html>
  );
}

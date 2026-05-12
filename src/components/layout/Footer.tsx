import Link from 'next/link';
import { MapPin, Phone, Shield, Truck, MessageCircle } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import NewsletterForm from '@/components/layout/NewsletterForm';
import BrandLogo from '@/components/ui/BrandLogo';

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const TRUST_SIGNALS = [
  {
    icon: Shield,
    label: 'Secure Orders',
    desc: 'Every transaction is protected'
  },
  {
    icon: Truck,
    label: 'Ghana Delivery',
    desc: 'Nationwide & beyond'
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp Support',
    desc: 'Direct, personal service'
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#1C0A0E] text-white relative overflow-hidden">

      {/* ─── Subtle Background Texture ─── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#C8102E]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#C9956C]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── TRUST SIGNALS STRIP ─── */}
        <div className="border-b border-white/8 py-8 lg:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
            {TRUST_SIGNALS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full border border-[#C9956C]/30 flex items-center justify-center flex-shrink-0 group-hover:border-[#C9956C] transition-colors duration-300">
                  <Icon size={16} className="text-[#C9956C]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-white text-xs font-bold tracking-wide">{label}</p>
                  <p className="text-white/40 text-[11px] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── NEWSLETTER ─── */}
        <div className="border-b border-white/8 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              {/* 🛠️ FIXED: Elevated, exclusive newsletter copy */}
              <div className="flex items-center gap-3 mb-4">
                <span className="block w-6 h-px bg-[#C9956C]" />
                <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-[#C9956C]">
                  Join the Archive
                </p>
              </div>
              <h3
                className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-3"
                style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600 }}
              >
                Receive early access.<br />
                <em className="not-italic font-light text-[#C9956C]">Before anyone else.</em>
              </h3>
              <p className="text-sm text-white/45 leading-relaxed max-w-sm font-light">
                New collections, exclusive pieces, and bespoke offers — delivered directly to you. No noise, just the edit.
              </p>
            </div>
            <div className="lg:justify-self-end w-full lg:max-w-sm">
              <NewsletterForm />
            </div>
          </div>
        </div>

        {/* ─── MAIN GRID ─── */}
        <div className="py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 lg:gap-12">

          {/* Brand Column */}
          <div className="sm:col-span-2">
            <Link href="/" className="inline-flex mb-5" aria-label="Luxury Steps Boutique, home">
              <BrandLogo size="lg" variant="full" color="white" />
            </Link>
            <p className="text-sm text-white/45 leading-relaxed max-w-sm mb-6 font-light" style={{ fontFamily: 'var(--font-jost)' }}>
              Luxury Steps Boutique is Rahinatu&apos;s edit of premium shoes and bags — heels, flats, handbags and clutches, sourced for those who walk with intention.
            </p>

            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/luxurystepsboutique"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all duration-300 hover:bg-white/5"
              >
                <InstagramIcon size={14} />
              </a>
              <a
                href="https://wa.me/233599670944"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all duration-300 hover:bg-white/5"
              >
                <WhatsAppIcon size={14} />
              </a>
              <a
                href="tel:+233599670944"
                aria-label="Call us"
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all duration-300 hover:bg-white/5"
              >
                <Phone size={13} strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-[#C9956C] mb-6">
              Navigate
            </h4>
            <nav className="flex flex-col gap-3.5">
              {[
                ['/', 'Home'],
                ['/products', 'Shop'],
                ['/wishlist', 'Wishlist'],
                ['/contact', 'Contact'],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-white/50 hover:text-white transition-colors duration-200 font-light w-fit group flex items-center gap-1.5"
                >
                  <span className="block w-0 group-hover:w-3 h-px bg-[#C9956C] transition-all duration-300" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-[#C9956C] mb-6">
              Get in Touch
            </h4>
            <div className="space-y-4 text-sm">
              <a
                href="https://wa.me/233599670944"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/50 hover:text-white transition-colors group"
              >
                <WhatsAppIcon size={14} className="text-[#C9956C] flex-shrink-0" />
                <span className="font-light">+233 59 967 0944</span>
              </a>
              <a
                href="tel:+233599670944"
                className="flex items-center gap-3 text-white/50 hover:text-white transition-colors"
              >
                <Phone size={13} strokeWidth={2} className="text-[#C9956C] flex-shrink-0" />
                <span className="font-light">+233 59 967 0944</span>
              </a>
              <div className="flex items-center gap-3 text-white/50">
                <MapPin size={13} strokeWidth={2} className="text-[#C9956C] flex-shrink-0" />
                <span className="font-light">KNUST Campus &amp; Ashaiman, Ghana 🇬🇭</span>
              </div>
              <a
                href="https://www.instagram.com/luxurystepsboutique"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/50 hover:text-white transition-colors"
              >
                <InstagramIcon size={13} />
                <span className="font-light">@luxurystepsboutique</span>
              </a>
            </div>
          </div>
        </div>

        {/* ─── BRAND WATERMARK ─── */}
        <div className="relative border-t border-white/8 pt-8 pb-4 overflow-hidden">
          <p
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-[clamp(5rem,20vw,14rem)] font-black text-white/[0.03] pointer-events-none select-none whitespace-nowrap tracking-widest"
            style={{ fontFamily: 'var(--font-cormorant)' }}
            aria-hidden="true"
          >
            L · S · B
          </p>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-white/25 tracking-wide">
              © {new Date().getFullYear()} Luxury Steps Boutique. All rights reserved.
            </p>
            <p className="text-[11px] text-white/25 tracking-wide">
              Crafted with <span className="text-[#C9956C]">♥</span> in Ghana
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}

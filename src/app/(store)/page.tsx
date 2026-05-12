export const dynamic = 'force-dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Product } from '@/types';
import { customOrderLink } from '@/lib/whatsapp';
import HeroSection from '@/components/home/HeroSection';
import ProductCard from '@/components/products/ProductCard';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    // 🛠️ FIXED: Fetched 11 items instead of 8 so Lookbook and Grid don't overlap
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/products?featured=true&limit=11`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    
    if (json.success) {
      return json.data ?? []; 
    } else {
      const all: Product[] = json.data ?? [];
      return all.filter((p) => p.featured).slice(0, 11);
    }
  } catch {
    return [];
  }
}

const CATEGORIES = [
  { label: 'Heels',            desc: 'Stilettos, pointed toe, platforms', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&q=85', href: '/products?category=heels' },
  { label: 'Flats & Slippers', desc: 'Flat slippers, slides, home',       img: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=900&q=85', href: '/products?category=flats' },
  { label: 'Handbags',         desc: 'Classic structured bags',           img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=85', href: '/products?category=handbags' },
  { label: 'Tote Bags',        desc: 'Roomy everyday carry',              img: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=900&q=85', href: '/products?category=tote' },
  { label: 'Crossbody',        desc: 'Crossbody & shoulder bags',         img: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=900&q=85', href: '/products?category=crossbody' },
  { label: 'Mini Bags',        desc: 'Clutches & mini bags',              img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=85', href: '/products?category=mini' },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  
  // 🛠️ FIXED: Split Lookbook (0-3) and Grid (3-11) so there are no duplicates
  const lookbookProducts = featured.slice(0, 3);
  const gridProducts = featured.slice(3, 11);

  return (
    <div className="bg-[#FFFAF8]">

      {/* HERO (Needs to be updated in its own file next!) */}
      <HeroSection />

      {/* ─── 1. EDITORIAL CATEGORIES ─── */}
      <section className="px-4 sm:px-6 lg:px-12 py-20 sm:py-28 lg:py-36 overflow-hidden">
        <div className="max-w-[1480px] mx-auto">
          <Reveal>
            <SectionHeader
              eyebrow="The Edit"
              heading={<>Shop by <em className="not-italic font-light text-[#C8102E]">category</em></>}
              description="Curated worlds of style. Discover the piece that defines your aesthetic."
              align="left"
              className="mb-12 lg:mb-16"
              cta={
                <Link
                  href="/products"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gray-900 hover:text-[#C8102E] transition-colors group"
                >
                  All Products
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              }
            />
          </Reveal>

          {/* 🛠️ FIXED: Horizontal Swipe Carousel on Mobile, Magazine Grid on Desktop */}
          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 pb-8 lg:pb-0 lg:grid lg:grid-cols-6 lg:grid-rows-2 lg:gap-5 w-full">
            {CATEGORIES.map((cat, i) => (
              <Reveal key={cat.label} stagger={i} className={`flex-shrink-0 w-[75vw] sm:w-[45vw] lg:w-auto snap-center ${i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}>
                <Link
                  href={cat.href}
                  className={`group relative block overflow-hidden bg-[#F5F1ED] rounded-2xl ${
                    i === 0 ? 'aspect-[4/5] lg:aspect-auto lg:h-full' : 'aspect-[4/5] lg:aspect-[3/4]'
                  }`}
                >
                  {/* 🛠️ FIXED: Replaced <img> with Next.js <Image /> */}
                  <Image
                    src={cat.img}
                    alt={cat.label}
                    fill
                    sizes="(max-width: 1024px) 75vw, 33vw"
                    className="object-cover transition-transform duration-[1200ms] ease-lux-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
                    <p className={`text-white font-black mb-1 tracking-tight ${i === 0 ? 'text-3xl lg:text-5xl' : 'text-xl lg:text-2xl'}`}>
                      {cat.label}
                    </p>
                    <p className={`text-white/75 ${i === 0 ? 'text-sm lg:text-base mt-2' : 'text-xs'}`}>
                      {cat.desc}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-4 text-[#C9956C] text-[10px] font-bold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500 ease-lux">
                      Discover <ArrowUpRight size={10} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 2. FEATURED PIECES ─── */}
      {gridProducts.length > 0 && (
        <section className="bg-white border-y border-gray-100 px-4 sm:px-6 lg:px-12 py-20 sm:py-28 lg:py-36">
          <div className="max-w-[1480px] mx-auto">
            <Reveal>
              <div className="flex items-end justify-between mb-12 lg:mb-16 flex-wrap gap-6">
                <SectionHeader
                  eyebrow="Featured"
                  heading={<>The <em className="not-italic font-light text-[#C8102E]">edit.</em></>}
                  description="Hand-selected from our latest arrivals. Uncompromising quality, designed for the modern aesthetic."
                  align="left"
                />
                <Link
                  href="/products"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gray-900 hover:text-[#C8102E] transition-colors group"
                >
                  View All
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-12 lg:gap-x-6 lg:gap-y-14">
              {gridProducts.map((p, i) => (
                <Reveal key={p.id} stagger={i % 4} direction="up">
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>

            <div className="text-center sm:hidden mt-12">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold text-xs uppercase tracking-[0.2em] px-10 py-4 rounded-full hover:bg-[#C8102E] active:scale-[0.97] transition-all duration-500 ease-lux"
              >
                View All Products <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── 3. EDITORIAL LOOKBOOK ─── */}
      {lookbookProducts.length === 3 && (
        <section className="px-4 sm:px-6 lg:px-12 py-20 sm:py-28 lg:py-36">
          <div className="max-w-[1480px] mx-auto">
            <Reveal>
              <SectionHeader
                eyebrow="Lookbook"
                heading={<>Curated <em className="not-italic font-light text-[#C8102E]">ensembles</em>.</>}
                description="A glimpse into the Luxury Steps lifestyle. Premium shoes and bags styled with intention."
                align="center"
                className="mb-14 lg:mb-20"
              />
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {lookbookProducts.map((p, i) => (
                <Reveal
                  key={p.id}
                  stagger={i}
                  className={
                    i === 0 ? 'lg:col-span-5' : i === 1 ? 'lg:col-span-4 lg:mt-16' : 'lg:col-span-3'
                  }
                >
                  <Link
                    href={`/products/${p.slug}`}
                    className="group relative block overflow-hidden rounded-3xl bg-[#F5F1ED] aspect-[3/4] shadow-sm hover:shadow-xl transition-shadow duration-500"
                  >
                    <Image
                      src={p.images?.[0] ?? `https://picsum.photos/seed/${p.id}/800/1066`}
                      alt={p.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition-transform duration-[1200ms] ease-lux-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                    <div className="absolute top-5 left-5">
                      <p className="text-[#C9956C] text-[10px] font-bold tracking-[0.3em] uppercase mix-blend-difference">
                        Look 0{i + 1}
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                      <p className="text-white text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight line-clamp-2">{p.name}</p>
                      <span className="inline-flex items-center gap-1.5 mt-3 text-white/90 text-[11px] font-bold tracking-[0.18em] uppercase">
                        Shop the Look
                        <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 4. BRAND STORY — large editorial split ─── */}
      <section className="bg-[#1A0A0A] text-white px-4 sm:px-6 lg:px-12 py-20 sm:py-28 lg:py-36 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(203,161,83,0.1),transparent_50%)]" />
        <div className="max-w-[1480px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

            <Reveal direction="left" className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=90"
                  alt="Luxury Steps Boutique Philosophy"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            <Reveal direction="right" delay={150} className="lg:col-span-7 order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <span className="block w-8 h-px bg-[#C9956C]" />
                <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-[#C9956C]">Our Philosophy</p>
              </div>
              <h2 className="font-black leading-[0.95] tracking-tight mb-8" style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }}>
                Style with{' '}
                <em className="not-italic font-light text-[#C9956C]">soul.</em>
              </h2>
              <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-6 max-w-xl">
                Luxury Steps Boutique is built on a simple belief: a beautiful pair changes how you move. Rahinatu hand-picks every heel, flat and bag for shape, comfort, and quiet presence.
              </p>
              <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
                Pickup at KNUST Campus or Ashaiman, delivery anywhere in Ghana. Talk to us on WhatsApp for sizing, availability, or styling advice.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-white text-[#1A0A0A] font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-[#C9956C] active:scale-[0.97] transition-all duration-500 ease-lux"
                >
                  Shop Collection
                  <ArrowRight size={13} />
                </Link>
                <a
                  href="https://instagram.com/luxurystepsboutique"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-white/20 text-white font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-white/10 hover:border-white/40 active:scale-[0.97] transition-all duration-500 ease-lux"
                >
                  @luxurystepsboutique
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 5. CUSTOM ORDER CTA ─── */}
      <section className="px-4 sm:px-6 lg:px-12 py-20 sm:py-28 lg:py-36">
        <div className="max-w-[1480px] mx-auto">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto">
              <div className="flex items-center gap-2.5 justify-center mb-6">
                <span className="block w-8 h-px bg-[#C8102E]" />
                <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.35em] uppercase text-[#C8102E]">
                  Bespoke Sourcing
                </p>
                <span className="block w-8 h-px bg-[#C8102E]" />
              </div>
              <h2 className="font-black text-gray-900 leading-[0.95] tracking-tight mb-8" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
                Have something{' '}
                <em className="not-italic font-light text-[#C8102E]">specific</em>{' '}
                in mind?
              </h2>
              <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-12 max-w-xl mx-auto">
                Talk to us directly. Share your vision, exact sizes, or specific color palettes, and we&apos;ll source or tailor it perfectly for you.
              </p>
              <a
                href={customOrderLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-gray-900 text-white font-bold text-sm tracking-[0.2em] uppercase px-12 py-5 rounded-full hover:bg-[#C8102E] active:scale-[0.97] transition-all duration-500 ease-lux shadow-2xl hover:shadow-[#C8102E]/30"
              >
                <WhatsAppIcon size={16} />
                Start a Conversation
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

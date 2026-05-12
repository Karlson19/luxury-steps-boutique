import Link from 'next/link';
import { Home, Search, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center px-4 py-20 relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#C8102E]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto text-center">
        {/* Big 404 with gradient */}
        <div className="relative inline-block mb-8 animate-slide-up">
          <h1
            className="font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#C8102E] via-[#7B1818] to-[#C9956C]"
            style={{ fontSize: 'clamp(7rem, 22vw, 14rem)' }}
          >
            404
          </h1>
          <span className="absolute -top-3 -right-3 sm:-right-6 text-3xl sm:text-5xl animate-float">✨</span>
        </div>

        <p className="text-[10px] sm:text-xs font-black tracking-[0.3em] uppercase text-[#C8102E] mb-3 animate-slide-up stagger-1">
          Page Not Found
        </p>
        <h2 className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight mb-4 animate-slide-up stagger-2">
          This piece is <span className="italic text-[#C8102E]">missing.</span>
        </h2>
        <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto leading-relaxed mb-10 animate-slide-up stagger-3">
          The page you&apos;re looking for might have moved, or never existed at all. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up stagger-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-[#C8102E] text-white font-black text-sm uppercase tracking-wider px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#C8102E]/20"
          >
            <Home size={14} strokeWidth={2.5} />
            Back to Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all"
          >
            Browse Shop <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-12 inline-flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 shadow-sm animate-slide-up stagger-5">
          <Search size={11} className="text-[#C8102E]" />
          <p className="text-[11px] text-gray-500">
            <span className="font-bold">Tip:</span> Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-black">⌘K</kbd> to search the collection.
          </p>
        </div>
      </div>
    </div>
  );
}

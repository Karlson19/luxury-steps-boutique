'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        setError('Wrong password. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-ink flex relative overflow-hidden">
      {/* Decorative side image (desktop) */}
      <div className="hidden lg:block w-1/2 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=85"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-between p-12">
          <div className="flex flex-col items-start gap-2">
            <BrandLogo size="md" variant="compact" color="white" />
            <p className="text-amber-400 text-[10px] font-bold tracking-[0.3em] uppercase">Admin Console</p>
          </div>
          <div className="max-w-md">
            <p className="text-amber-400 text-xs font-bold tracking-[0.35em] uppercase mb-4">Welcome back</p>
            <h1 className="font-black text-white leading-[0.95] tracking-editorial mb-5" style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)' }}>
              Manage with{' '}
              <em className="not-italic font-light text-amber-400">elegance.</em>
            </h1>
            <p className="text-sm text-white/60 leading-relaxed">
              Your private space to curate, price, promote, and orchestrate the entire collection.
            </p>
          </div>
          <p className="text-[10px] text-white/30 font-bold tracking-[0.25em] uppercase">
            Premium · Ghana · Established
          </p>
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16 relative">
        {/* Subtle ambient blob */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-burgundy/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-sm animate-slide-up">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center justify-center mb-10">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-burgundy to-burgundy-light flex items-center justify-center mx-auto mb-4 shadow-lux-2">
                <Lock size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <p className="text-white font-black text-lg">Luxury Steps Boutique</p>
              <p className="text-amber-400 text-[10px] font-bold tracking-[0.3em] uppercase mt-1">Admin Console</p>
            </div>
          </div>

          <div className="hidden lg:block mb-8">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-400 mb-3">Sign In</p>
            <h2 className="font-black text-white leading-[1] tracking-editorial" style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }}>
              Enter your password.
            </h2>
            <p className="text-sm text-white/50 mt-3">
              Private console. Only you have access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/50 block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoFocus
                  className="w-full px-5 py-4 pr-12 text-base font-medium text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:bg-white/10 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 animate-slide-down">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-ink font-black text-sm tracking-[0.2em] uppercase py-4 rounded-xl active:scale-[0.97] transition-all duration-500 ease-lux disabled:opacity-40 disabled:cursor-not-allowed shadow-lux-2 hover:shadow-lux-3"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={14} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-white/30 mt-10 tracking-[0.2em] uppercase font-bold">
            Luxury Steps Boutique · Admin Only
          </p>
        </div>
      </div>
    </div>
  );
}

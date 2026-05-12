'use client';

import { useState } from 'react';
import { Mail, Send, Check, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'footer' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setDone(true);
      toast.success(json.already ? "You're already subscribed!" : 'Welcome aboard!', "We'll keep you in the loop.");
      setEmail('');
      setTimeout(() => setDone(false), 5000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not subscribe');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="relative w-full max-w-md">
      <div className="relative flex items-center bg-white/5 border border-white/10 backdrop-blur rounded-2xl overflow-hidden focus-within:border-amber-400/50 focus-within:ring-4 focus-within:ring-amber-400/10 transition-all">
        <Mail size={15} className="absolute left-4 text-amber-400/70" strokeWidth={2} />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={loading || done}
          className="flex-1 pl-10 pr-2 py-3.5 bg-transparent text-sm font-medium text-white placeholder:text-white/30 outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || done || !email.trim()}
          className="m-1 px-4 sm:px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-xs uppercase tracking-wider rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : done ? (
            <><Check size={13} strokeWidth={2.5} /> Done</>
          ) : (
            <><Send size={12} strokeWidth={2.5} /> <span className="hidden sm:inline">Subscribe</span></>
          )}
        </button>
      </div>
      <p className="text-[10px] text-white/40 mt-2 ml-1">No spam, unsubscribe anytime.</p>
    </form>
  );
}

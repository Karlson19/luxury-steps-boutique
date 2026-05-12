'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

const DISMISS_KEY = 'jcu_announcement_dismissed_v1';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(DISMISS_KEY) !== '1') {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, '1');
  }

  if (!visible) return null;

  return (
    <div className="bg-ink text-white h-9 flex items-center px-4 sm:px-6 lg:px-10 relative z-50 overflow-hidden">
      <div className="flex items-center gap-2 text-xs font-light flex-1 min-w-0">
        <Sparkles size={11} className="text-gold flex-shrink-0" strokeWidth={2} />
        <span className="truncate">
          New arrivals weekly. Custom orders welcome on WhatsApp.
        </span>
      </div>
      <div className="hidden md:flex items-center gap-4 text-white/50 text-xs font-light pl-4">
        <span>WhatsApp support</span>
        <span className="w-1 h-1 rounded-full bg-white/30" />
        <span>Curated daily</span>
        <span className="w-1 h-1 rounded-full bg-white/30" />
        <span>Made in Ghana</span>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="ml-3 p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-all"
      >
        <X size={12} strokeWidth={2.5} />
      </button>
    </div>
  );
}

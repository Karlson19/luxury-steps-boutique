'use client';

import { useState, useEffect } from 'react';
import { X, Monitor } from 'lucide-react';

const STORAGE_KEY = 'lsb-admin-install-dismissed';

export default function AdminInstallBanner() {
  const [visible, setVisible] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    // Capture prompt if browser supports it
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Always show after a short delay — don't rely on beforeinstallprompt
    const timer = setTimeout(() => setVisible(true), 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  function handleDismiss() {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setVisible(false);
        return;
      }
    }
    // Fallback: point them to the browser install icon
    alert('To install: click the ⊕ install icon in your browser\'s address bar, then click "Install".');
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 left-4 z-[100] animate-slide-up"
      style={{ width: 'calc(100% - 32px)', maxWidth: '380px' }}
    >
      <div className="bg-[#1A0A0A] rounded-2xl shadow-2xl p-4 pr-12 relative border border-white/10 flex items-center gap-4">

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-[#C9956C] to-[#A87850] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <Monitor size={20} className="text-[#1A0A0A]" strokeWidth={2.5} />
        </div>

        {/* Text & Button */}
        <div className="flex-1">
          <p className="text-white text-sm font-bold tracking-wide" style={{ fontFamily: 'var(--font-jost)' }}>
            Install Admin Console
          </p>
          <p className="text-white/70 text-[11px] mb-2 font-medium" style={{ fontFamily: 'var(--font-jost)' }}>
            Click &ldquo;Install Now&rdquo; or the ⊕ icon in your address bar.
          </p>
          <button
            onClick={handleInstall}
            className="bg-white text-[#1A0A0A] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full hover:bg-[#C9956C] active:scale-95 transition-all shadow-md"
            style={{ fontFamily: 'var(--font-jost)' }}
          >
            Install Now
          </button>
        </div>

      </div>
    </div>
  );
}

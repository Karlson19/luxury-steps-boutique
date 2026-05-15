'use client';

import { useState, useEffect } from 'react';
import { X, Monitor } from 'lucide-react';

// Localstorage key for the "snooze until" timestamp. Same pattern as the
// storefront install banner — see InstallAppBanner.tsx for the rationale.
const STORAGE_KEY = 'lsb-admin-install-dismissed-until';

const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days when dismissed
const FOREVER_MS = 365 * 24 * 60 * 60 * 1000; // effectively never after install

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BeforeInstallPromptEvent = any;

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window.navigator as any).standalone === true) return true;
  return false;
}

function snoozedUntilNow(): boolean {
  if (typeof localStorage === 'undefined') return false;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  const ts = parseInt(raw, 10);
  return Number.isFinite(ts) && Date.now() < ts;
}

function snooze(ms: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now() + ms));
  } catch { /* private mode */ }
}

export default function AdminInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Already running as installed PWA — never show
    if (isStandalone()) return;
    // Snoozed window in effect — stay quiet
    if (snoozedUntilNow()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const onInstalled = () => {
      snooze(FOREVER_MS);
      setVisible(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', onInstalled);

    // Show the banner shortly after page settle so it doesn't flash in
    const timer = setTimeout(() => setVisible(true), 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
      clearTimeout(timer);
    };
  }, []);

  function handleDismiss() {
    snooze(SNOOZE_MS);
    setVisible(false);
  }

  async function handleInstall() {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          snooze(FOREVER_MS);
          setVisible(false);
          setDeferredPrompt(null);
          return;
        }
        // User cancelled the native prompt — snooze
        snooze(SNOOZE_MS);
        setVisible(false);
        setDeferredPrompt(null);
        return;
      } catch {
        snooze(SNOOZE_MS);
        setVisible(false);
        return;
      }
    }
    // Fallback for browsers that don't fire beforeinstallprompt (e.g. iOS Safari)
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

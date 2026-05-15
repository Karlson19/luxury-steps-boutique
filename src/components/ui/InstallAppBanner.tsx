'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, Download, Share, Plus } from 'lucide-react';

// Localstorage key for the "snooze until" timestamp. We persist a UNIX ms value:
// while Date.now() < value, the banner is hidden. After it, the banner can show
// again. On install or explicit "never" we set this far enough in the future
// that it effectively never fires (a year).
const STORAGE_KEY = 'lsb-install-dismissed-until';

// Default snooze window when the user dismisses, OR when they tap Install
// but then cancel the browser's native prompt. Long enough not to nag, short
// enough that someone who genuinely wanted the app gets reminded.
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const FOREVER_MS = 365 * 24 * 60 * 60 * 1000; // 1 year — used after a successful install

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BeforeInstallPromptEvent = any;

// "Already installed as PWA" check works on both Chrome-family browsers
// (display-mode: standalone) and iOS Safari (navigator.standalone).
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  // iOS Safari exposes a non-standard 'standalone' flag
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window.navigator as any).standalone === true) return true;
  return false;
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    && !(window as any).MSStream;
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

export default function InstallAppBanner() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [hidden, setHidden] = useState(true); // start hidden, decide on mount

  // ─── Decide whether to show anything at all ───
  useEffect(() => {
    // Never show inside /admin (admin has its own banner)
    if (pathname?.startsWith('/admin')) {
      setHidden(true);
      return;
    }

    // Never show if the user is already inside the installed PWA
    if (isStandalone()) {
      setHidden(true);
      return;
    }

    // Honour the snooze window — quietly stay hidden, no flash
    if (snoozedUntilNow()) {
      setHidden(true);
      return;
    }

    // iOS doesn't fire beforeinstallprompt; show an instructions banner instead.
    // Delay slightly so the banner doesn't appear before the page settles.
    if (isIOS()) {
      const t = setTimeout(() => {
        setShowIOS(true);
        setHidden(false);
      }, 1500);
      return () => clearTimeout(t);
    }

    // Chrome/Edge/Android path — wait for the browser to tell us we're installable
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // If the user installs via the browser's own UI (address bar icon),
    // the appinstalled event fires — wipe state and snooze a long time so
    // we don't try to show the banner again on this device.
    const onInstalled = () => {
      setDeferredPrompt(null);
      setShowIOS(false);
      setHidden(true);
      snooze(FOREVER_MS);
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [pathname]);

  function handleDismiss() {
    snooze(SNOOZE_MS);
    setHidden(true);
  }

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        // Banner won't fire again on this device because beforeinstallprompt
        // stops firing post-install. Belt + braces snooze too.
        snooze(FOREVER_MS);
        setDeferredPrompt(null);
        setHidden(true);
      } else {
        // User saw the native prompt and tapped "Cancel" — give them 7 days
        // of peace before asking again.
        snooze(SNOOZE_MS);
        setDeferredPrompt(null);
        setHidden(true);
      }
    } catch {
      // Some browsers throw if prompt() is called twice. Soft-fail.
      snooze(SNOOZE_MS);
      setHidden(true);
    }
  }

  if (hidden) return null;

  // ── iOS banner: instructions, no programmatic install ──
  if (showIOS) {
    return (
      <div
        className="fixed bottom-6 left-4 sm:w-96 z-[100] animate-slide-up"
        style={{ width: 'calc(100% - 32px)', maxWidth: '380px' }}
      >
        <div className="bg-[#1A0A0A] rounded-2xl shadow-2xl p-4 pr-12 relative border border-white/10 flex items-start gap-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
          <div className="w-12 h-12 bg-gradient-to-br from-[#C9956C] to-[#A87850] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Plus size={20} className="text-[#1A0A0A]" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-white text-sm font-bold tracking-wide mb-1"
              style={{ fontFamily: 'var(--font-jost)' }}
            >
              Install Luxury Steps
            </p>
            <p
              className="text-white/70 text-[11px] leading-relaxed font-medium"
              style={{ fontFamily: 'var(--font-jost)' }}
            >
              Tap{' '}
              <Share
                size={11}
                strokeWidth={2.5}
                className="inline-block align-text-bottom text-[#C9956C]"
              />
              {' '}then <span className="font-bold text-white">Add to Home Screen</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Chrome/Edge/Android banner: real install button ──
  return (
    <div
      className="fixed bottom-6 left-4 sm:w-96 z-[100] animate-slide-up"
      style={{ width: 'calc(100% - 32px)', maxWidth: '380px' }}
    >
      <div className="bg-[#1A0A0A] rounded-2xl shadow-2xl p-4 pr-12 relative border border-white/10 flex items-center gap-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
        <div className="w-12 h-12 bg-gradient-to-br from-[#C9956C] to-[#A87850] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <Download size={20} className="text-[#1A0A0A]" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <p className="text-white text-sm font-bold tracking-wide" style={{ fontFamily: 'var(--font-jost)' }}>
            Get the Luxury Steps App
          </p>
          <p className="text-white/70 text-[11px] mb-2 font-medium" style={{ fontFamily: 'var(--font-jost)' }}>
            Fast, smooth, and easy shopping.
          </p>
          <button
            onClick={handleInstallClick}
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

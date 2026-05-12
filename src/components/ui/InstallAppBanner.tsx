'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, Download } from 'lucide-react';

export default function InstallAppBanner() {
  const pathname = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Listen for the browser telling us the app is ready to be installed
    const handler = (e: Event) => {
      // Prevent the default ugly Android mini-banner
      e.preventDefault();
      // Save the event so we can trigger it when our custom button is clicked
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  if (pathname?.startsWith('/admin')) return null;
  if (!deferredPrompt || isDismissed) return null;

  const handleInstallClick = async () => {
    // Show the browser's install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setDeferredPrompt(null); // Hide the banner once installed
    }
  };

  return (
    // ✨ FIXED: Changed right-4 to left-4 for desktop so it stays away from the WhatsApp button!
    // On mobile, it will be centered with safe margins from both edges.
    <div className="fixed bottom-6 left-4 sm:w-96 z-[100] animate-slide-up" style={{ width: 'calc(100% - 32px)', maxWidth: '380px' }}>
      <div className="bg-[#1A0A0A] rounded-2xl shadow-2xl p-4 pr-12 relative border border-white/10 flex items-center gap-4">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-[#C9956C] to-[#A87850] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <Download size={20} className="text-[#1A0A0A]" strokeWidth={2.5} />
        </div>

        {/* Text & Button */}
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

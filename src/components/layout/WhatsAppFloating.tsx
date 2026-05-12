'use client';

import { useState, useEffect } from 'react';
import { generalEnquiryLink } from '@/lib/whatsapp';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import { X } from 'lucide-react';

export default function WhatsAppFloating() {
  const [show, setShow] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);

  useEffect(() => {
    // Show after 1s delay so it doesn't feel intrusive
    const t = setTimeout(() => setShow(true), 1200);
    // Auto-show tip once after 4s
    const t2 = setTimeout(() => setTipOpen(true), 4500);
    // Auto-hide tip after 8s
    const t3 = setTimeout(() => setTipOpen(false), 12500);
    return () => { clearTimeout(t); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed right-4 sm:right-5 z-30 flex flex-col items-end gap-3 whatsapp-float">
      {/* Tooltip / quick message */}
      {tipOpen && (
        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-[260px] animate-fade-in">
          <button
            onClick={() => setTipOpen(false)}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={14} />
          </button>
          <div className="flex items-start gap-3 pr-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C8102E] to-[#7B1818] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-xs">L</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Hello there 👋</p>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                Need help? Tap to chat with us on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main button */}
      <a
        href={generalEnquiryLink()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setTipOpen(false)}
        className="relative w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 hover:scale-110 active:scale-95 transition-all duration-200"
        aria-label="Chat with us on WhatsApp"
      >
        <WhatsAppIcon size={26} className="text-white" />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
      </a>
    </div>
  );
}

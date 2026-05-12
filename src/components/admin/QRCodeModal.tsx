'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Download, Copy, Printer, ExternalLink, QrCode, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface Props {
  url: string;
  productName: string;
  productImage?: string;
  onClose: () => void;
}

function buildQrSrc(url: string, size = 800) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=0&color=1A0A0A&bgcolor=ffffff&qzone=2&data=${encodeURIComponent(url)}`;
}

export default function QRCodeModal({ url, productName, productImage, onClose }: Props) {
  // ✨ FIXED 1: Replaced boolean with specific action state to prevent both buttons from spinning
  const [loadingAction, setLoadingAction] = useState<'download' | 'print' | null>(null);
  const displayQrSrc = buildQrSrc(url, 400);

  // ✨ FIXED 2: Added scroll-lock effect so the background page freezes
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  function copyLink() {
    navigator.clipboard?.writeText(url);
    toast.success('Link copied!', 'Paste it anywhere to share.');
  }

  // 🎨 Generates a stunning High-Res Canvas Image of the Tag
  async function generateTagImage(): Promise<string> {
    const res = await fetch(buildQrSrc(url, 800));
    const blob = await res.blob();
    const qrObjUrl = URL.createObjectURL(blob);

    const qrImg = new window.Image();
    await new Promise((resolve, reject) => {
      qrImg.onload = resolve;
      qrImg.onerror = reject;
      qrImg.src = qrObjUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1800;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    // 1. Background (White)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Elegant double border
    ctx.strokeStyle = '#1A0A0A';
    ctx.lineWidth = 6;
    ctx.strokeRect(60, 60, 1080, 1680);
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 80, 1040, 1640);

    // 3. LSB Brand (Serif)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#1A0A0A';
    ctx.font = 'bold 120px "Times New Roman", Times, serif';
    ctx.fillText('L · S · B', 600, 220);

    // 4. Sub-brand
    ctx.fillStyle = '#1A0A0A';
    ctx.font = 'bold 32px Arial, Helvetica, sans-serif';
    const ctxExt = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
    if (ctxExt.letterSpacing !== undefined) {
      ctxExt.letterSpacing = '16px';
      ctx.fillText('LUXURY STEPS BOUTIQUE', 600, 360);
      ctxExt.letterSpacing = '0px';
    } else {
      ctx.fillText('LUXURY STEPS BOUTIQUE', 600, 360);
    }
    
    // 5. Product Name
    ctx.fillStyle = '#1A0A0A';
    ctx.font = 'bold 50px Arial, Helvetica, sans-serif';
    const words = productName.toUpperCase().split(' ');
    let line = '';
    let y = 520;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 900 && n > 0) {
        ctx.fillText(line, 600, y);
        line = words[n] + ' ';
        y += 70; 
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 600, y);

    // 6. Draw the QR Code
    const qrSize = 700;
    const qrY = y + 140; 
    ctx.drawImage(qrImg, 600 - (qrSize / 2), qrY, qrSize, qrSize);

    URL.revokeObjectURL(qrObjUrl);

    // 7. Footer Divider Line
    const footerY = 1620;
    ctx.beginPath();
    ctx.moveTo(350, footerY - 70);
    ctx.lineTo(850, footerY - 70);
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 8. Footer Text
    ctx.fillStyle = '#1A0A0A';
    ctx.font = 'bold 30px Arial, Helvetica, sans-serif';
    if (ctxExt.letterSpacing !== undefined) {
      ctxExt.letterSpacing = '12px';
      ctx.fillText('SCAN TO VIEW', 600, footerY);
    } else {
      ctx.fillText('S C A N   T O   V I E W', 600, footerY);
    }

    return canvas.toDataURL('image/jpeg', 1.0);
  }

  async function handleDownload() {
    if (loadingAction) return;
    setLoadingAction('download');
    try {
      const dataUrl = await generateTagImage();
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `lsb-tag-${productName.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('High-Res Tag Downloaded!', 'Perfect for social media or printing.');
    } catch {
      toast.error('Failed to generate image', 'Please check your connection and try again.');
    } finally {
      setLoadingAction(null);
    }
  }

  async function handlePrint() {
    if (loadingAction) return;
    setLoadingAction('print');
    try {
      const dataUrl = await generateTagImage();
      const w = window.open('', '_blank', 'width=800,height=900');
      if (!w) throw new Error('Popup blocked');

      w.document.write(`
        <!doctype html>
        <html>
          <head>
            <title>Print Tag | ${productName}</title>
            <style>
              body { margin: 0; padding: 20px; display: flex; justify-content: center; background: #fff; }
              img { max-width: 100%; height: auto; width: 3.5in; border-radius: 4px; }
              @media print {
                @page { margin: 0; }
                body { padding: 0; align-items: flex-start; }
                img { width: 3in; } 
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="setTimeout(() => { window.print(); }, 250);" />
          </body>
        </html>
      `);
      w.document.close();
    } catch {
      toast.error('Failed to print', 'Ensure popups are allowed for this site.');
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div 
      // ✨ FIXED 3: Added h-[100dvh] so it flawlessly adapts to mobile address bars shrinking/expanding
      className="fixed inset-0 h-[100dvh] w-screen bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in overscroll-none" 
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:w-[420px] rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up sm:animate-fade-in overflow-hidden relative max-h-[95dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── HEADER ─── */}
        <div className="bg-[#1A0A0A] text-white px-6 py-5 relative overflow-hidden flex-shrink-0">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C9956C]/20 rounded-full blur-2xl pointer-events-none" />
          
          <button 
            type="button"
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all z-20"
            aria-label="Close modal"
          >
            <X size={20} strokeWidth={2} />
          </button>

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/10">
              <QrCode size={20} className="text-[#C9956C]" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Product Tag</h3>
              <p className="text-[11px] text-white/60 mt-0.5 tracking-wider uppercase">Scan, Download or Print</p>
            </div>
          </div>
        </div>

        {/* ─── CONTENT (Scrollable if screen is very short) ─── */}
        <div className="p-6 overflow-y-auto no-scrollbar flex-1">
          <div className="relative bg-gray-50 rounded-2xl p-5 border border-gray-200">
            
            {/* Product Meta */}
            {productImage && (
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <div className="relative w-12 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 border border-gray-300">
                  <Image src={productImage} alt={productName} fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C9956C]">Luxury Steps Boutique</p>
                  <p className="text-sm font-bold text-[#1A0A0A] truncate mt-0.5">{productName}</p>
                </div>
              </div>
            )}

            {/* QR display visual */}
            <div className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayQrSrc}
                alt="QR code"
                className="w-48 h-48 mix-blend-multiply"
                width={200}
                height={200}
              />
            </div>

            {/* URL Input */}
            <div className="mt-4 flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl group transition-all text-left shadow-sm">
              <ExternalLink size={12} className="text-gray-400 flex-shrink-0" />
              <span className="text-[10px] text-gray-500 truncate flex-1 font-mono">{url}</span>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 text-center mt-4 leading-relaxed font-medium uppercase tracking-widest">
            Have a friend scan to view instantly.
          </p>
        </div>

        {/* ─── FOOTER ACTIONS ─── */}
        <div className="border-t border-gray-100 px-6 py-5 grid grid-cols-3 gap-3 bg-gray-50 flex-shrink-0">
          <button 
            type="button"
            onClick={copyLink} 
            disabled={loadingAction !== null}
            className="flex flex-col items-center gap-1.5 p-3 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all active:scale-95 disabled:opacity-50"
          >
            <Copy size={18} className="text-[#1A0A0A]" strokeWidth={1.5} />
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mt-1">Copy Link</span>
          </button>
          
          <button 
            type="button"
            onClick={handleDownload} 
            disabled={loadingAction !== null}
            className="flex flex-col items-center gap-1.5 p-3 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {loadingAction === 'download' ? <Loader2 size={18} className="text-[#1A0A0A] animate-spin" /> : <Download size={18} className="text-[#1A0A0A]" strokeWidth={1.5} />}
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mt-1">Save Tag</span>
          </button>
          
          <button 
            type="button"
            onClick={handlePrint} 
            disabled={loadingAction !== null}
            className="flex flex-col items-center gap-1.5 p-3 bg-[#1A0A0A] hover:bg-[#C9956C] rounded-xl transition-all active:scale-95 shadow-lg shadow-[#1A0A0A]/10 disabled:opacity-50"
          >
            {loadingAction === 'print' ? <Loader2 size={18} className="text-white animate-spin" /> : <Printer size={18} className="text-white" strokeWidth={1.5} />}
            <span className="text-[9px] font-bold uppercase tracking-widest text-white mt-1">Print Tag</span>
          </button>
        </div>
      </div>
    </div>
  );
}

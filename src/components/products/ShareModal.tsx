'use client';

import Image from 'next/image';
import { X, Download, Copy, Printer, ExternalLink, QrCode } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import { toast } from '@/components/ui/Toast';

interface Props {
  url: string;
  productName: string;
  productImage?: string;
  productPrice?: number;
  onClose: () => void;
}

function buildQrSrc(url: string, size = 600) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=20&color=1A0B0E&bgcolor=ffffff&qzone=2&data=${encodeURIComponent(url)}`;
}

export default function ShareModal({ url, productName, productImage, productPrice, onClose }: Props) {
  const qrSrc = buildQrSrc(url, 600);

  function copyLink() {
    navigator.clipboard?.writeText(url);
    toast.success('Link copied!', 'Paste it anywhere to share.');
  }

  async function downloadQR() {
    try {
      const res = await fetch(buildQrSrc(url, 1200));
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `qr-${productName.toLowerCase().replace(/\s+/g, '-').slice(0, 40)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      toast.success('QR downloaded');
    } catch {
      toast.error('Could not download');
    }
  }

  function printQR() {
    const w = window.open('', '_blank', 'width=420,height=620');
    if (!w) return;
    const priceLine = productPrice ? `<p class="price">GHS ${productPrice.toLocaleString()}</p>` : '';
    w.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${productName} | Luxury Steps Boutique</title>
          <style>
            body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:40px;color:#1A0A0A;background:#FFFAF8;display:flex;align-items:center;justify-content:center;min-height:100vh}
            .card{text-align:center;max-width:360px;background:#fff;padding:40px 30px;border-radius:24px;box-shadow:0 8px 40px rgba(0,0,0,0.08)}
            .brand{font-size:11px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#C8102E;margin-bottom:6px}
            h1{font-size:26px;font-weight:900;line-height:1.05;margin:0 0 14px;letter-spacing:-0.02em}
            .price{font-size:18px;font-weight:900;color:#1A0A0A;margin:0 0 24px;letter-spacing:-0.01em}
            img{width:100%;height:auto;border:2px solid #FFE0DA;border-radius:20px;padding:16px;background:#fff;display:block}
            .url{font-size:10px;color:#7A5050;word-break:break-all;margin-top:16px;padding:8px 12px;background:#FFFAF8;border-radius:8px;font-family:monospace}
            .footer{font-size:9px;color:#A89A9D;margin-top:18px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase}
          </style>
        </head>
        <body>
          <div class="card">
            <p class="brand">Luxury Steps Boutique</p>
            <h1>${productName}</h1>
            ${priceLine}
            <img src="${buildQrSrc(url, 1200)}" alt="QR" onload="setTimeout(()=>window.print(),200)">
            <p class="url">${url}</p>
            <p class="footer">Scan to view product</p>
          </div>
        </body>
      </html>
    `);
    w.document.close();
  }

  function whatsappShare() {
    const text = `Check out *${productName}* on Luxury Steps Boutique${productPrice ? ` (GHS ${productPrice.toLocaleString()})` : ''}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  return (
    <div className="fixed inset-0 bg-ink/60 backdrop-blur-md z-[55] flex items-end sm:items-center justify-center px-0 sm:px-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-champagne w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-lux-3 animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-ink via-burgundy-dark to-burgundy text-white px-6 py-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/15 rounded-full blur-2xl" />
          <button onClick={onClose} className="absolute top-3 right-3 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <X size={18} />
          </button>
          <div className="relative">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-400 mb-2">Share this piece</p>
            <h3 className="text-2xl font-black tracking-editorial leading-tight line-clamp-1">
              {productName}
            </h3>
          </div>
        </div>

        {/* QR card */}
        <div className="px-6 pt-6">
          <div className="relative bg-white rounded-3xl p-5 sm:p-6 border border-bone shadow-lux-1">
            {/* Mini product header */}
            {productImage && (
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-bone">
                <div className="relative w-12 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-bone">
                  <Image src={productImage} alt={productName} fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-burgundy mb-0.5">Luxury Steps Boutique</p>
                  <p className="text-sm font-black text-ink truncate">{productName}</p>
                  {productPrice !== undefined && (
                    <p className="text-xs font-bold text-ink-500 tabular-nums">GHS {productPrice.toLocaleString()}</p>
                  )}
                </div>
                <QrCode size={18} className="text-burgundy flex-shrink-0" strokeWidth={2} />
              </div>
            )}

            {/* QR */}
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrSrc} alt="QR code" className="w-full h-auto block" width={600} height={600} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-burgundy to-burgundy-light flex items-center justify-center shadow-xl ring-4 ring-white">
                  <span className="text-white font-black">L</span>
                </div>
              </div>
            </div>

            {/* URL pill */}
            <button
              onClick={copyLink}
              className="mt-4 w-full flex items-center gap-2 px-3 py-2.5 bg-champagne hover:bg-bone border border-bone hover:border-burgundy rounded-xl group transition-all text-left"
            >
              <ExternalLink size={12} className="text-ink-300 group-hover:text-burgundy flex-shrink-0" />
              <span className="text-[11px] text-ink-500 truncate flex-1 font-mono">{url}</span>
              <Copy size={12} className="text-ink-300 group-hover:text-burgundy flex-shrink-0" />
            </button>
          </div>

          <p className="text-[11px] text-ink-300 text-center mt-4">
            Anyone who scans goes straight to this product.
          </p>
        </div>

        {/* Action grid */}
        <div className="px-6 pt-5 pb-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <ActionTile onClick={whatsappShare} label="WhatsApp" icon={<WhatsAppIcon size={16} />} accent="green" />
          <ActionTile onClick={copyLink} label="Copy Link" icon={<Copy size={15} strokeWidth={2.5} />} />
          <ActionTile onClick={downloadQR} label="Download" icon={<Download size={15} strokeWidth={2.5} />} />
          <ActionTile onClick={printQR} label="Print" icon={<Printer size={15} strokeWidth={2.5} />} primary />
        </div>
      </div>
    </div>
  );
}

function ActionTile({
  onClick, label, icon, primary, accent,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  primary?: boolean;
  accent?: 'green';
}) {
  const cls = primary
    ? 'bg-gradient-to-br from-burgundy to-burgundy-light text-white shadow-lux-2 hover:shadow-lux-3'
    : accent === 'green'
      ? 'bg-green-500 text-white hover:bg-green-600 shadow-lux-1'
      : 'bg-white border border-bone text-ink hover:border-burgundy hover:bg-bone';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3.5 rounded-2xl transition-all duration-300 ease-lux active:scale-95 ${cls}`}
    >
      <span className="flex items-center justify-center w-7 h-7">{icon}</span>
      <span className="text-[10px] font-black tracking-[0.18em] uppercase">{label}</span>
    </button>
  );
}

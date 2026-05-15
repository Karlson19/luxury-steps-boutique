'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ShoppingBag, Minus, Plus, Trash2, Tag, Loader2 } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { cartCheckoutLink, type CheckoutDetails } from '@/lib/whatsapp';
import { formatPrice } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import CheckoutDetailsModal from './CheckoutDetailsModal';

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { items, removeItem, updateQty, subtotal, total, itemCount, discount, applyDiscount, removeDiscount } = useCartStore();

  function openCart() {
    setOpen(true);
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    setOpen(false);
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }

  useEffect(() => {
    window.addEventListener('cart:open', openCart);
    window.addEventListener('cart:close', closeCart);
    return () => {
      window.removeEventListener('cart:open', openCart);
      window.removeEventListener('cart:close', closeCart);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, []);

  const sub = subtotal();
  const grand = total();
  const count = itemCount();
  const savings = discount?.amount ?? 0;

  // Build the WhatsApp link once the customer has filled in delivery details
  // in the modal. The link embeds their name / phone / location / payment so
  // Rahinatu receives a complete order — no [Type your name] placeholders.
  function handleSendOrder(details: CheckoutDetails) {
    const url = cartCheckoutLink(
      items.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
        slug: i.slug,
      })),
      grand,
      {
        subtotal: sub,
        discount: discount ? { code: discount.code, amount: discount.amount } : undefined,
        details,
      },
    );
    window.open(url, '_blank', 'noopener,noreferrer');
    setCheckoutOpen(false);
    closeCart();
  }

  async function applyCode() {
    if (!code.trim() || validating) return;
    setValidating(true);
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), subtotal: sub }),
      });
      
      let json;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      if (!res.ok) {
        throw new Error(json?.error || 'Invalid or expired promo code.');
      }
      
      applyDiscount(json.data);
      toast.success(`Code ${json.data.code} applied!`, `You saved GHS ${json.data.amount.toLocaleString()}`);
      setCode('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setValidating(false);
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity animate-fade-in"
          onClick={closeCart}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[100] flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ─── HEADER ─── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-[#C8102E]">
              <ShoppingBag size={18} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-none" style={{ fontFamily: 'var(--font-cormorant)' }}>Your Bag</h2>
              <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-wider">{count} {count === 1 ? 'piece' : 'pieces'}</p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-[#C8102E] transition-colors rounded-xl hover:bg-rose-50 active:scale-95"
            aria-label="Close cart"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* ─── ITEMS ─── */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-5 animate-fade-in">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-amber-100 rounded-3xl flex items-center justify-center">
                  <ShoppingBag size={32} strokeWidth={1.5} className="text-[#C8102E]" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center text-base">
                  ✨
                </div>
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 mb-1">Your bag is empty</p>
                <p className="text-sm text-gray-500">Add pieces you love and they&apos;ll appear here.</p>
              </div>
              <Link
                href="/products"
                onClick={closeCart}
                className="bg-gradient-to-r from-gray-900 to-[#C8102E] text-white font-black text-xs uppercase tracking-wider px-7 py-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#C8102E]/20"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 py-4 group">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="relative w-20 h-24 flex-shrink-0 bg-gray-100 overflow-hidden rounded-xl hover:scale-105 transition-transform"
                  >
                    <Image src={item.image || `https://picsum.photos/seed/${item.id}/80/96`} alt={item.name} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 hover:text-[#C8102E] transition-colors"
                    >
                      {item.name}
                    </Link>
                    
                    {/* ✨ UPDATED: Display Size AND Color elegantly */}
                    {(item.size || item.color) && (
                      <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                        {item.color && (
                          <span>Color: <span className="text-gray-700">{item.color}</span></span>
                        )}
                        {item.color && item.size && <span className="text-gray-300">|</span>}
                        {item.size && (
                          <span>Size: <span className="text-gray-700">{item.size}</span></span>
                        )}
                      </p>
                    )}

                    <p className="text-base font-black text-[#C8102E] mt-1.5">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#C8102E] hover:bg-white transition-colors active:scale-90"
                        >
                          <Minus size={11} strokeWidth={2.5} />
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-sm font-black text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#C8102E] hover:bg-white transition-colors active:scale-90"
                        >
                          <Plus size={11} strokeWidth={2.5} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 active:scale-90"
                      >
                        <Trash2 size={14} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── FOOTER & CHECKOUT ─── */}
        {items.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-100 px-5 py-4 space-y-3 bg-gradient-to-b from-white to-gray-50">

            {/* Discount input */}
            {!discount ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2.5} />
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && applyCode()}
                    placeholder="Discount code"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-bold uppercase tracking-wider bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#C8102E] focus:ring-4 focus:ring-[#C8102E]/10 transition-all"
                  />
                </div>
                <button
                  onClick={applyCode}
                  disabled={!code.trim() || validating}
                  className="px-4 py-2.5 bg-gray-900 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#C8102E] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {validating ? <Loader2 size={13} className="animate-spin" /> : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl animate-slide-up">
                <div className="flex items-center gap-3 min-w-0">
                  <Tag size={16} className="text-emerald-600 flex-shrink-0" strokeWidth={2} />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-emerald-800 truncate uppercase tracking-widest">{discount.code} Applied</p>
                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                      You save {formatPrice(savings)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeDiscount}
                  className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded-lg hover:bg-emerald-100 flex-shrink-0 transition-colors"
                >
                  <X size={15} strokeWidth={2.5} />
                </button>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-bold">Subtotal</span>
                <span className="font-bold text-gray-700">{formatPrice(sub)}</span>
              </div>
              {discount && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-600 font-bold">Discount ({discount.code})</span>
                  <span className="font-bold text-emerald-600">-{formatPrice(savings)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Total</span>
                <span className="text-xl font-black text-gray-900">{formatPrice(grand)}</span>
              </div>
            </div>

            {/* Checkout — opens the delivery-details modal first */}
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="btn-shine flex items-center justify-center gap-2 w-full bg-gradient-to-r from-gray-900 via-[#C8102E] to-gray-900 bg-[length:200%_100%] hover:bg-[100%_0] text-white font-black text-xs uppercase tracking-wider py-4 rounded-2xl active:scale-[0.98] transition-all duration-500 shadow-xl shadow-[#C8102E]/25"
            >
              <WhatsAppIcon size={15} />
              Checkout via WhatsApp
            </button>
            <button
              disabled
              className="w-full text-gray-400 text-[10px] font-bold uppercase tracking-wider py-2 cursor-not-allowed"
            >
              Pay Online (Coming Soon)
            </button>
          </div>
        )}
      </aside>

      <CheckoutDetailsModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSubmit={handleSendOrder}
        itemCount={count}
        total={grand}
      />
    </>
  );
}

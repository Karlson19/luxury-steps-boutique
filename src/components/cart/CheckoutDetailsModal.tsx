'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Phone, MapPin, Wallet, MessageSquare, ArrowLeft, Check } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import { CheckoutDetails } from '@/lib/whatsapp';
import { formatPrice } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (details: CheckoutDetails) => void;
  itemCount: number;
  total: number;
}

const STORAGE_KEY = 'lsb-checkout-details';

type Payment = CheckoutDetails['payment'];

const PAYMENT_OPTIONS: { value: Payment; label: string; emoji: string }[] = [
  { value: 'MOMO',             label: 'MOMO',             emoji: '💸' },
  { value: 'Bank Transfer',    label: 'Bank Transfer',    emoji: '🏦' },
  { value: 'Cash on Delivery', label: 'Cash on Delivery', emoji: '💵' },
];

// Loose phone validation — Ghana mobiles vary in how they're typed
// (with/without country code, with/without spaces). Just count digits.
function countDigits(s: string): number {
  return s.replace(/\D/g, '').length;
}

export default function CheckoutDetailsModal({
  open,
  onClose,
  onSubmit,
  itemCount,
  total,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+233 ');
  const [location, setLocation] = useState('');
  const [payment, setPayment] = useState<Payment | ''>('');
  const [note, setNote] = useState('');
  const [save, setSave] = useState(true);
  const [touched, setTouched] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  // Pre-fill from localStorage once the component mounts in the browser
  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<CheckoutDetails>;
      if (saved.name)     setName(saved.name);
      if (saved.phone)    setPhone(saved.phone);
      if (saved.location) setLocation(saved.location);
      if (saved.payment)  setPayment(saved.payment);
      if (saved.note)     setNote(saved.note);
    } catch {
      /* ignore */
    }
  }, [mounted]);

  // Lock body scroll + autofocus the first empty field whenever the modal opens
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      if (!name) nameRef.current?.focus();
    }, 150);
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [open, onClose, name]);

  const nameValid     = name.trim().length >= 2;
  const phoneValid    = countDigits(phone) >= 9;
  const locationValid = location.trim().length >= 3;
  const paymentValid  = payment !== '';
  const formValid     = nameValid && phoneValid && locationValid && paymentValid;

  function handleSubmit() {
    setTouched(true);
    if (!formValid || !payment) return;

    const details: CheckoutDetails = {
      name: name.trim(),
      phone: phone.trim(),
      location: location.trim(),
      payment,
      note: note.trim() || undefined,
    };

    if (save) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
      } catch {
        /* ignore */
      }
    }

    onSubmit(details);
  }

  if (!open || !mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
    >
      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: 'var(--font-jost)' }}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C8102E] mb-1.5">
              Almost there ✦
            </p>
            <h2
              id="checkout-title"
              className="text-2xl text-[#1A0A0A] leading-none"
              style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600 }}
            >
              Delivery details
            </h2>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              We&apos;ll send your order to Rahinatu on WhatsApp.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-gray-400 hover:text-[#C8102E] rounded-xl hover:bg-rose-50 active:scale-95 transition-all -mr-2 -mt-2"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* FIELDS — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Name */}
          <Field
            icon={<User size={14} strokeWidth={2} />}
            label="Full Name"
            error={touched && !nameValid ? 'Please enter your name' : undefined}
          >
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Akosua Mensah"
              autoComplete="name"
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#C8102E] focus:ring-4 focus:ring-[#C8102E]/10 transition-all placeholder:text-gray-400"
            />
          </Field>

          {/* Phone */}
          <Field
            icon={<Phone size={14} strokeWidth={2} />}
            label="WhatsApp Number"
            error={touched && !phoneValid ? 'Phone needs at least 9 digits' : undefined}
          >
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+233 24 567 8901"
              autoComplete="tel"
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#C8102E] focus:ring-4 focus:ring-[#C8102E]/10 transition-all placeholder:text-gray-400"
            />
          </Field>

          {/* Location */}
          <Field
            icon={<MapPin size={14} strokeWidth={2} />}
            label="Delivery Location"
            hint="Town or area + nearest landmark"
            error={touched && !locationValid ? 'Where should we deliver?' : undefined}
          >
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="East Legon, near A&C Mall"
              autoComplete="street-address"
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#C8102E] focus:ring-4 focus:ring-[#C8102E]/10 transition-all placeholder:text-gray-400"
            />
          </Field>

          {/* Payment method */}
          <Field
            icon={<Wallet size={14} strokeWidth={2} />}
            label="Payment Method"
            error={touched && !paymentValid ? 'Pick a payment method' : undefined}
          >
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_OPTIONS.map(({ value, label, emoji }) => {
                const active = payment === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPayment(value)}
                    className={`relative flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
                      active
                        ? 'bg-[#C8102E] text-white ring-2 ring-[#C8102E] ring-offset-2 shadow-md'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-[#C8102E]/40 hover:text-[#C8102E]'
                    }`}
                  >
                    <span className="text-base leading-none">{emoji}</span>
                    <span className="leading-tight text-center text-[10px]">{label}</span>
                    {active && (
                      <Check size={12} strokeWidth={3} className="absolute top-1.5 right-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Note */}
          <Field
            icon={<MessageSquare size={14} strokeWidth={2} />}
            label="Note for Rahinatu"
            hint="Optional"
          >
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything Rahinatu should know? (Optional)"
              rows={2}
              maxLength={200}
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#C8102E] focus:ring-4 focus:ring-[#C8102E]/10 transition-all placeholder:text-gray-400 resize-none"
            />
          </Field>

          {/* Save for next time */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={save}
              onChange={(e) => setSave(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#C8102E] focus:ring-[#C8102E]/30"
            />
            <span className="text-xs text-gray-600">
              Save my details for next time
            </span>
          </label>
        </div>

        {/* FOOTER */}
        <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 bg-gradient-to-b from-white to-gray-50 space-y-3">
          {/* Live order summary */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
            <span className="font-bold text-[#1A0A0A]">
              Total: <span className="text-[#C8102E]">{formatPrice(total)}</span>
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-[#1A0A0A] rounded-2xl border border-gray-200 hover:border-gray-300 active:scale-95 transition-all"
            >
              <ArrowLeft size={12} strokeWidth={2.5} />
              Back
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formValid && touched}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg ${
                formValid
                  ? 'bg-gradient-to-r from-[#0D6E4B] to-[#0B5C3F] text-white shadow-[#0D6E4B]/25 hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              <WhatsAppIcon size={14} />
              {formValid ? 'Send Order on WhatsApp' : 'Fill details to continue'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Reusable labelled field wrapper ───
function Field({
  icon,
  label,
  hint,
  error,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-700">
          <span className="text-[#C9956C]">{icon}</span>
          {label}
        </label>
        {hint && !error && <span className="text-[10px] text-gray-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="text-[10px] text-[#C8102E] mt-1.5 font-medium">{error}</p>
      )}
    </div>
  );
}

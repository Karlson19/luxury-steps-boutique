'use client';

import { useState } from 'react';
import {
  Clock,
  Send,
  Check,
  Loader2,
} from 'lucide-react';
import { generalEnquiryLink } from '@/lib/whatsapp';
import { InstagramIcon, FacebookIcon } from '@/components/icons/SocialIcons';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

type InquiryType = 'order' | 'custom' | 'styling' | 'returns' | 'other';

const INQUIRY_TYPES: { id: InquiryType; label: string }[] = [
  { id: 'order', label: 'Order Enquiry' },
  { id: 'custom', label: 'Custom Piece' },
  { id: 'styling', label: 'Styling Advice' },
  { id: 'returns', label: 'Returns' },
  { id: 'other', label: 'Other' },
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  custom: string;
  message: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  custom: '',
  message: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const [inquiry, setInquiry] = useState<InquiryType>('order');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'Please enter your name';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!EMAIL_RE.test(form.email))
      next.email = 'Please enter a valid email';
    if (!form.message.trim()) next.message = 'Add a short message';
    if (inquiry === 'custom' && !form.custom.trim())
      next.custom = 'Tell us what you have in mind';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    // Simulated submit — visual layer only. Replace with real POST when ready.
    await new Promise((r) => setTimeout(r, 1200));
    setStatus('success');
    setTimeout(() => {
      setForm(EMPTY_FORM);
      setStatus('idle');
    }, 3000);
  }

  const showCustomField = inquiry === 'custom';

  const baseInputClass =
    'w-full rounded-xl bg-champagne border border-bone px-4 py-3 text-ink placeholder:text-[#C4A4AF] outline-none transition-all duration-200 focus:border-burgundy focus:ring-2 focus:ring-burgundy/15 focus:bg-white';

  return (
    <div
      className="min-h-dvh pt-20 lg:pt-24 pb-16"
      style={{
        backgroundColor: '#FFFAF8',
        backgroundImage:
          'radial-gradient(circle, rgba(123,29,46,0.03) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        fontFamily: 'var(--font-jost)',
      }}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-20">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
          {/* LEFT — brand info */}
          <div className="lg:sticky lg:top-28 mb-12 lg:mb-0">
            <p
              className="text-[11px] uppercase text-gold mb-4"
              style={{ fontWeight: 500, letterSpacing: '0.25em' }}
            >
              Get in Touch
            </p>
            <h1
              className="text-4xl sm:text-5xl text-ink italic leading-[1.1] mb-5"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontWeight: 600,
              }}
            >
              We&apos;d Love to Hear From You
            </h1>
            <p
              className="text-sm text-ink-500 leading-relaxed max-w-sm mb-10"
              style={{ fontWeight: 300 }}
            >
              Whether you have a question about an order, need sizing advice,
              or want to ask about a pair you spotted — we&apos;re here. Rahinatu
              personally reads every message.
            </p>

            <div className="flex flex-col gap-5">
              {[
                {
                  icon: <WhatsAppIcon className="w-4 h-4 text-[#0D6E4B]" size={16} />,
                  iconBg: 'bg-[#0D6E4B]/10',
                  label: 'WhatsApp',
                  value: '+233 59 967 0944',
                  sub: 'Fastest response',
                  href: 'https://wa.me/233599670944',
                  external: true,
                },
                {
                  icon: <Clock className="w-4 h-4 text-burgundy" strokeWidth={1.75} />,
                  iconBg: 'bg-burgundy/10',
                  label: 'Hours',
                  value: 'Mon–Sat, 9am–6pm GMT',
                  sub: undefined as string | undefined,
                  href: undefined as string | undefined,
                  external: false,
                },
              ].map(({ icon, iconBg, label, value, sub, href, external }) => {
                const content = (
                  <>
                    <span className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
                      {icon}
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span
                        className="text-[10px] uppercase tracking-wider text-ink-500 mb-0.5"
                        style={{ fontWeight: 500 }}
                      >
                        {label}
                      </span>
                      <span
                        className="text-sm text-ink truncate"
                        style={{ fontWeight: 400 }}
                      >
                        {value}
                      </span>
                      {sub && (
                        <span
                          className="text-xs text-ink-500"
                          style={{ fontWeight: 300 }}
                        >
                          {sub}
                        </span>
                      )}
                    </span>
                  </>
                );
                return href ? (
                  <a
                    key={label}
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="flex items-start gap-4 group"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={label} className="flex items-start gap-4">
                    {content}
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-gradient-to-r from-bone via-gold/30 to-transparent mt-10 mb-8" />

            <div>
              <p
                className="text-xs text-ink-500 mb-3"
                style={{ fontWeight: 300 }}
              >
                Follow @luxurystepsboutique
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/luxurystepsboutique"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full border border-bone bg-white flex items-center justify-center text-ink-500 hover:text-burgundy hover:border-burgundy/40 hover:shadow-md active:scale-90 transition-all duration-200"
                >
                  <InstagramIcon size={16} />
                </a>
                <a
                  href="https://www.facebook.com/luxurystepsboutique"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full border border-bone bg-white flex items-center justify-center text-ink-500 hover:text-burgundy hover:border-burgundy/40 hover:shadow-md active:scale-90 transition-all duration-200"
                >
                  <FacebookIcon size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT — form card */}
          <div
            className="bg-white rounded-3xl border border-bone p-6 sm:p-8 lg:p-10"
            style={{ boxShadow: '0 1px 4px rgba(123,29,46,0.07)' }}
          >
            <h2
              className="text-2xl text-ink mb-1"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontWeight: 600,
              }}
            >
              Send a Message
            </h2>
            <p
              className="text-sm text-ink-500 mb-7"
              style={{ fontWeight: 300 }}
            >
              We&apos;ll get back to you within one business day.
            </p>

            {status === 'success' && (
              <div className="bg-[#F0FAF5] border border-[#B8D8C4] rounded-2xl px-5 py-4 mb-5 flex items-center gap-3 animate-fade-in">
                <Check className="w-5 h-5 text-[#0D6E4B]" strokeWidth={2.5} />
                <p
                  className="text-sm text-[#0D6E4B]"
                  style={{ fontWeight: 400 }}
                >
                  Thanks {form.name.split(' ')[0] || 'so much'}! We&apos;ll be in touch soon.
                </p>
              </div>
            )}

            <form onSubmit={onSubmit} noValidate>
              {/* Inquiry type */}
              <div className="mb-6">
                <p
                  className="text-[11px] uppercase tracking-wider text-ink-500 mb-3"
                  style={{ fontWeight: 500 }}
                >
                  What&apos;s this about?
                </p>
                <div className="flex flex-wrap gap-2">
                  {INQUIRY_TYPES.map((t) => {
                    const active = inquiry === t.id;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setInquiry(t.id)}
                        className={`rounded-full px-4 py-2 text-xs transition-all duration-200 active:scale-[0.97] ${
                          active
                            ? 'bg-burgundy text-white border border-burgundy'
                            : 'bg-champagne border border-bone text-ink-500 hover:border-burgundy/40 hover:text-burgundy'
                        }`}
                        style={{
                          fontWeight: active ? 600 : 500,
                          boxShadow: active
                            ? '0 4px 12px rgba(123,29,46,0.20)'
                            : undefined,
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-5">
                {/* Row 1 — name + phone */}
                <div className="sm:grid sm:grid-cols-2 sm:gap-4 flex flex-col gap-5 sm:flex-row sm:gap-x-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="name"
                      className="text-[11px] uppercase tracking-wider text-ink-500"
                      style={{ fontWeight: 500 }}
                    >
                      Full Name <span className="text-burgundy">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Ama Mensah"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      className={baseInputClass}
                      style={{
                        fontSize: '16px',
                        fontFamily: 'var(--font-jost)',
                        fontWeight: 400,
                      }}
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && (
                      <span
                        className="text-xs text-[#B91C3A] mt-0.5"
                        style={{ fontWeight: 400 }}
                      >
                        {errors.name}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="phone"
                      className="text-[11px] uppercase tracking-wider text-ink-500"
                      style={{ fontWeight: 500 }}
                    >
                      Phone / WhatsApp
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+233 ..."
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      className={baseInputClass}
                      style={{
                        fontSize: '16px',
                        fontFamily: 'var(--font-jost)',
                        fontWeight: 400,
                      }}
                    />
                  </div>
                </div>

                {/* Row 2 — email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-[11px] uppercase tracking-wider text-ink-500"
                    style={{ fontWeight: 500 }}
                  >
                    Email Address <span className="text-burgundy">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className={baseInputClass}
                    style={{
                      fontSize: '16px',
                      fontFamily: 'var(--font-jost)',
                      fontWeight: 400,
                    }}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <span
                      className="text-xs text-[#B91C3A] mt-0.5"
                      style={{ fontWeight: 400 }}
                    >
                      {errors.email}
                    </span>
                  )}
                </div>

                {/* Row 3 — custom (animated) */}
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    showCustomField ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="custom"
                        className="text-[11px] uppercase tracking-wider text-ink-500"
                        style={{ fontWeight: 500 }}
                      >
                        What are you envisioning? <span className="text-burgundy">*</span>
                      </label>
                      <textarea
                        id="custom"
                        rows={3}
                        placeholder="Describe the item, colours, occasion..."
                        value={form.custom}
                        onChange={(e) => update('custom', e.target.value)}
                        className={`${baseInputClass} resize-none`}
                        style={{
                          fontSize: '16px',
                          fontFamily: 'var(--font-jost)',
                          fontWeight: 400,
                        }}
                        aria-invalid={!!errors.custom}
                      />
                      {errors.custom && (
                        <span
                          className="text-xs text-[#B91C3A] mt-0.5"
                          style={{ fontWeight: 400 }}
                        >
                          {errors.custom}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 4 — message */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="message"
                    className="text-[11px] uppercase tracking-wider text-ink-500"
                    style={{ fontWeight: 500 }}
                  >
                    Message <span className="text-burgundy">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Tell us more..."
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    className={`${baseInputClass} resize-none`}
                    style={{
                      fontSize: '16px',
                      fontFamily: 'var(--font-jost)',
                      fontWeight: 400,
                    }}
                    aria-invalid={!!errors.message}
                  />
                  {errors.message && (
                    <span
                      className="text-xs text-[#B91C3A] mt-0.5"
                      style={{ fontWeight: 400 }}
                    >
                      {errors.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'sending' || status === 'success'}
                className={`w-full mt-6 flex items-center justify-center gap-2 rounded-full py-4 text-sm uppercase tracking-widest text-white transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed ${
                  status === 'success'
                    ? 'bg-[#0D6E4B]'
                    : 'bg-burgundy hover:bg-burgundy-light'
                }`}
                style={{
                  fontWeight: 600,
                  boxShadow:
                    status === 'success'
                      ? '0 8px 30px rgba(13,110,75,0.25)'
                      : '0 8px 30px rgba(123,29,46,0.25)',
                }}
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : status === 'success' ? (
                  <>
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                    Message Sent ✓
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" strokeWidth={2} />
                    Send Message
                  </>
                )}
              </button>

              <p
                className="mt-4 text-center text-xs text-ink-500"
                style={{ fontWeight: 300 }}
              >
                Prefer instant replies?{' '}
                <a
                  href={generalEnquiryLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0D6E4B] hover:underline"
                  style={{ fontWeight: 600 }}
                >
                  Chat with us on WhatsApp →
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

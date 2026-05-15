const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '233599670944';

function getStoreUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://luxurystepsboutique.vercel.app';
}

function waLink(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

function generateOrderId(): string {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

interface CartLineItem {
  name: string;
  price: number;
  quantity: number;
  slug?: string;
  size?: string;
  color?: string;
}

export interface CheckoutDetails {
  name: string;
  phone: string;
  location: string;
  payment: 'MOMO' | 'Bank Transfer' | 'Cash on Delivery';
  note?: string;
}

interface CartCheckoutOptions {
  subtotal?: number;
  discount?: { code: string; amount: number };
  details?: CheckoutDetails;
}

// ─── SEPARATOR ───
// em dash (—) is exactly 1em wide on every font/device, unlike ━ which renders
// at ~1.5× width on some Android fonts and wraps unexpectedly.
const SEP = '———————————————';

export function cartCheckoutLink(
  items: CartLineItem[],
  total: number,
  options: CartCheckoutOptions = {}
): string {
  const store = getStoreUrl();
  const orderId = generateOrderId();

  let msg = `🛍️ *LUXURY STEPS BOUTIQUE | ORDER REQUEST*\n`;
  msg += `_Ref: #LSB-${orderId}_\n\n`;
  msg += `Kindly process the following order:\n\n`;

  const lines = items.map((i, idx) => {
    let itemText = `📦 *${idx + 1}. ${i.name}*\n`;

    if (i.color) itemText += `↳ Color: ${i.color}\n`;
    if (i.size)  itemText += `↳ Size: ${i.size}\n`;

    itemText += `↳ Qty: ${i.quantity}\n`;

    if (i.quantity > 1) {
      itemText += `↳ Price: ${i.quantity} x GHS ${i.price.toLocaleString()} = GHS ${(i.price * i.quantity).toLocaleString()}\n`;
    } else {
      itemText += `↳ Price: GHS ${i.price.toLocaleString()}\n`;
    }

    if (i.slug) itemText += `🔗 ${store}/products/${i.slug}`;

    return itemText;
  }).join('\n\n');

  msg += lines + `\n\n${SEP}\n`;

  if (options.subtotal !== undefined && options.discount) {
    msg += `*Subtotal:* GHS ${options.subtotal.toLocaleString()}\n`;
    msg += `*Discount* (${options.discount.code}): -GHS ${options.discount.amount.toLocaleString()}\n`;
  }

  msg += `💰 *Order Total: GHS ${total.toLocaleString()}*\n`;
  msg += `_(Excl. Delivery)_\n\n`;

  msg += `📋 *DELIVERY & PAYMENT DETAILS:*\n`;
  if (options.details) {
    const { name, phone, location, payment, note } = options.details;
    msg += `👤 *Name:* ${name}\n`;
    msg += `📞 *Phone:* ${phone}\n`;
    msg += `📍 *Location:* ${location}\n`;
    msg += `💳 *Payment:* ${payment}\n`;
    if (note && note.trim().length > 0) {
      msg += `📝 *Note:* ${note.trim()}\n`;
    }
    msg += `\n_Please confirm availability and my final total._`;
  } else {
    // Legacy fallback — shouldn't happen now that the checkout modal collects
    // these on-site, but kept so old call sites don't crash.
    msg += `👤 *Name:* [Type your name]\n`;
    msg += `📞 *Phone:* [Type phone number]\n`;
    msg += `📍 *Location:* [Type delivery area / landmark]\n`;
    msg += `💳 *Payment:* [MOMO / Bank / Cash]\n\n`;
    msg += `_Please confirm availability and my final total._`;
  }

  return waLink(msg);
}

export function singleProductOrderLink(name: string, price: number, qty: number, slug?: string, size?: string, color?: string): string {
  const store = getStoreUrl();
  let msg = `🛍️ *LUXURY STEPS BOUTIQUE | INQUIRY*\n\n`;
  msg += `I am interested in the following piece:\n\n`;
  msg += `📦 *${name}*\n`;

  if (color) msg += `↳ Color: ${color}\n`;
  if (size)  msg += `↳ Size: ${size}\n`;
  msg += `↳ Qty: ${qty}\n`;

  if (qty > 1) {
    msg += `↳ Price: ${qty} x GHS ${price.toLocaleString()} = GHS ${(price * qty).toLocaleString()}\n`;
  } else {
    msg += `↳ Price: GHS ${price.toLocaleString()}\n`;
  }

  if (slug) msg += `🔗 ${store}/products/${slug}\n`;
  msg += `\n${SEP}\n`;
  msg += `Kindly confirm availability.`;

  return waLink(msg);
}

export function customOrderLink(): string {
  return waLink(`✨ *LUXURY STEPS BOUTIQUE | BESPOKE INQUIRY*\n\nI am interested in a custom order and would like to discuss sourcing, sizing, or tailoring options.`);
}

export function generalEnquiryLink(): string {
  return waLink(`💬 *LUXURY STEPS BOUTIQUE | CLIENT SERVICES*\n\nGood day. I have an inquiry regarding your collections.`);
}

export function quickProductOrderLink(name: string, price: number, slug?: string): string {
  const store = getStoreUrl();
  let msg = `🛍️ *LUXURY STEPS BOUTIQUE | INQUIRY*\n\n`;
  msg += `I am inquiring about the availability of:\n\n`;
  msg += `📦 *${name}* (GHS ${price.toLocaleString()})\n`;
  if (slug) msg += `🔗 ${store}/products/${slug}`;

  return waLink(msg);
}

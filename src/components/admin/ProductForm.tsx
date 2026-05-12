'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Sparkles, Check, ArrowLeft, Trash2, Save, Eye, EyeOff,
  Tag as TagIcon, Star, Flame, Box, Image as ImageIcon,
  Type, DollarSign, Layers, FileText, ListChecks, Ruler,
  Settings as SettingsIcon, X, AlertCircle, Footprints,
  ShoppingBag, Briefcase, Wallet, Palette,
  LucideIcon,
} from 'lucide-react';
import { Product, Category, ProductTag } from '@/types';
import { generateSlug, formatPrice } from '@/lib/utils';
import ImageUpload from './ImageUpload';
import TagInput from './TagInput';
import AIDescriptionModal from './AIDescriptionModal';

const CATEGORIES: { value: Category; label: string; icon: LucideIcon; hint: string }[] = [
  { value: 'heels',     label: 'Heels',            icon: Footprints,  hint: 'Stilettos, pointed toe, platform heels' },
  { value: 'flats',     label: 'Flats & Slippers', icon: Footprints,  hint: 'Flat slippers, slide sandals, home slippers' },
  { value: 'handbags',  label: 'Handbags',         icon: ShoppingBag, hint: 'Classic structured bags' },
  { value: 'tote',      label: 'Tote Bags',        icon: Briefcase,   hint: 'Roomy totes for everyday carry' },
  { value: 'crossbody', label: 'Crossbody',        icon: ShoppingBag, hint: 'Crossbody & shoulder bags' },
  { value: 'mini',      label: 'Mini Bags',        icon: Wallet,      hint: 'Clutches & mini bags' },
];

const TAGS: { value: ProductTag; label: string; color: string; icon: LucideIcon | null }[] = [
  { value: '', label: 'No Label', color: 'gray', icon: null },
  { value: 'New', label: 'New', color: 'gray', icon: Sparkles },
  { value: 'Bestseller', label: 'Bestseller', color: 'primary', icon: Star },
  { value: 'Limited', label: 'Limited', color: 'amber', icon: Flame },
  { value: 'Sale', label: 'Sale', color: 'red', icon: TagIcon },
];

const TAG_PILL_STYLE: Record<string, string> = {
  New: 'bg-gray-900 text-white',
  Bestseller: 'bg-burgundy text-white',
  Limited: 'bg-amber-500 text-gray-900',
  Sale: 'bg-red-500 text-white',
};

const SIZE_PRESETS: { label: string; sizes: string[] }[] = [
  { label: 'Clothing (XS to XXL)', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'Shoes (36 to 45)', sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'] },
  { label: 'Waist (28 to 40)', sizes: ['28', '30', '32', '34', '36', '38', '40'] },
];

interface Props {
  product?: Product;
  mode: 'new' | 'edit';
}

export default function ProductForm({ product, mode }: Props) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
  const [comparePrice, setComparePrice] = useState(product?.compare_price?.toString() ?? '');
  const [category, setCategory] = useState<Category>(product?.category ?? 'heels');
  const [description, setDescription] = useState(product?.description ?? '');
  const [aiNote, setAiNote] = useState(false);
  const [details, setDetails] = useState<string[]>(product?.details ?? []);
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? []);
  const [colors, setColors] = useState<string[]>(product?.colors ?? []);
  const [material, setMaterial] = useState(product?.material ?? '');
  const [tag, setTag] = useState<ProductTag>(product?.tag ?? '');
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [customSlug, setCustomSlug] = useState(product?.slug ?? '');
  const [stockCount, setStockCount] = useState(product?.stock_count?.toString() ?? '');
  
  const [showAI, setShowAI] = useState(false);
  const [showCustomSize, setShowCustomSize] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftKey = mode === 'new' ? 'product-draft-new' : `product-draft-${product?.id}`;

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.name) { setName(draft.name); }
      if (draft.price) { setPrice(draft.price); }
      if (draft.comparePrice) { setComparePrice(draft.comparePrice); }
      if (draft.category) { setCategory(draft.category); }
      if (draft.description) { setDescription(draft.description); }
      if (draft.details?.length) { setDetails(draft.details); }
      if (draft.sizes?.length) { setSizes(draft.sizes); }
      if (draft.colors?.length) { setColors(draft.colors); }
      if (draft.material) { setMaterial(draft.material); }
      if (draft.tag !== undefined) { setTag(draft.tag); }
      if (draft.featured !== undefined) { setFeatured(draft.featured); }
      if (draft.inStock !== undefined) { setInStock(draft.inStock); }
      if (draft.images?.length) { setImages(draft.images); }
      setDraftRestored(true);
      setDraftSavedAt(new Date(draft.savedAt));
    } catch { /* ignore corrupt drafts */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave draft 2s after any change
  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({
          name, price, comparePrice, category, description,
          details, sizes, colors, material, tag, featured, inStock, images,
          savedAt: new Date().toISOString(),
        }));
        setDraftSavedAt(new Date());
        setIsDirty(true);
      } catch { /* storage full or unavailable */ }
    }, 2000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
    }, [name, price, comparePrice, category, description, details, sizes, colors, material, tag, featured, inStock, images, draftKey]);

  // Warn before closing tab with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Completion progress
  const completion = useMemo(() => {
    let done = 0;
    if (images.length > 0) done++;
    if (name.trim()) done++;
    if (price && !isNaN(Number(price))) done++;
    if (category) done++;
    if (description.trim()) done++;
    return Math.round((done / 5) * 100);
  }, [images, name, price, category, description]);

  async function save(stockOverride?: boolean) {
    if (!name.trim()) { setError('Please enter a product name.'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (!price || isNaN(Number(price))) { setError('Please enter a valid price.'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (images.length === 0) { setError('Please add at least one photo.'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    setSaving(true);
    setError('');

    const payload = {
      name: name.trim(),
      slug: customSlug || product?.slug || generateSlug(name),
      stock_count: stockCount ? Number(stockCount) : null,
      category,
      price: Number(price),
      compare_price: comparePrice && !isNaN(Number(comparePrice)) && Number(comparePrice) > Number(price)
        ? Number(comparePrice)
        : null,
      description: description.trim() || null,
      details: details.length > 0 ? details : null,
      sizes: sizes.length > 0 ? sizes : null,
      colors: colors.length > 0 ? colors : null,
      material: material.trim() || null,
      images,
      tag: tag || null,
      featured,
      in_stock: stockOverride !== undefined ? stockOverride : inStock,
    };

    try {
      const isEdit = mode === 'edit' && product?.id;
      const res = await fetch('/api/admin/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: product!.id, ...payload } : payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      localStorage.removeItem(draftKey);
      setIsDirty(false);
      if (mode === 'edit') {
        setRedirecting(true);
        setTimeout(() => router.push('/admin/dashboard'), 1000);
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      setError('Something went wrong saving your product. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct() {
    if (!product?.id) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, slug: product.slug }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      setIsDirty(false);
      router.push('/admin/dashboard');
    } catch {
      setDeleteError('Could not delete product. Please try again.');
      setDeleting(false);
    }
  }

  // Success screen (new product only)
  if (success && mode === 'new') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl animate-scale-in border border-gray-100">
          <div className="relative inline-flex mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <Check size={36} strokeWidth={3} className="text-white" />
            </div>
            <div className="absolute -inset-2 bg-green-500/20 rounded-3xl blur-xl -z-10 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Product is live!</h2>
          <p className="text-sm text-gray-500 mb-8">Customers can see <strong className="text-gray-900">{name}</strong> in your shop now.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                localStorage.removeItem(draftKey);
                setSuccess(false); setImages([]); setName(''); setPrice(''); setDescription('');
                setDetails([]); setSizes([]); setTag(''); setFeatured(false); setInStock(true);
                window.scrollTo({ top: 0 });
              }}
              className="bg-gradient-to-r from-burgundy to-burgundy-light text-white font-black text-sm py-4 rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-burgundy/30 hover:shadow-xl"
            >
              + Add Another Product
            </button>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gray-100 text-gray-700 font-bold text-sm py-3.5 rounded-2xl hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => router.push('/products')}
              className="text-burgundy text-xs font-bold uppercase tracking-wider hover:underline"
            >
              View on Store →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-champagne pb-32">

      {/* ─── STICKY HEADER ─── */}
      <header className="sticky top-0 z-30 bg-champagne/85 backdrop-blur-xl border-b border-bone">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-12 py-3.5 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-ink-500 hover:text-ink text-xs font-bold tracking-[0.18em] uppercase px-3 py-2 rounded-xl hover:bg-bone transition-all"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="w-px h-6 bg-bone" />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-burgundy">
              {mode === 'edit' ? 'Editing' : 'New Listing'}
            </p>
            <h1 className="text-base sm:text-lg font-black text-ink truncate tracking-editorial leading-tight">
              {mode === 'edit' ? (product?.name || 'Edit Product') : 'Create Product'}
            </h1>
          </div>

          {/* Progress ring (desktop) */}
          <div className="hidden md:flex items-center gap-3 mr-2">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Completion</p>
              <p className="text-sm font-black text-gray-900">{completion}%</p>
            </div>
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke="url(#g)" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${(completion / 100) * 88} 88`}
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C8102E" />
                    <stop offset="100%" stopColor="#C9956C" />
                  </linearGradient>
                </defs>
              </svg>
              {completion === 100 && (
                <Check size={14} strokeWidth={3} className="absolute inset-0 m-auto text-green-600" />
              )}
            </div>
          </div>

          {/* Preview toggle (mobile only) */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-bone text-ink-500 hover:bg-bone hover:text-ink text-xs font-bold transition-all"
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Preview'}</span>
          </button>

          {/* Save button */}
          <button
            onClick={() => save()}
            disabled={saving || redirecting}
            className="flex items-center gap-1.5 bg-gradient-to-r from-ink via-burgundy to-ink bg-[length:200%_100%] hover:bg-[100%_0] text-white text-xs font-black tracking-[0.2em] uppercase px-5 sm:px-6 py-3 rounded-xl active:scale-95 transition-all duration-500 ease-lux disabled:opacity-50 shadow-lux-2 hover:shadow-lux-3"
          >
            <Save size={13} strokeWidth={2.5} />
            <span className="hidden sm:inline">{redirecting ? 'Saved! Redirecting…' : saving ? 'Saving…' : (mode === 'edit' ? 'Save Changes' : 'Publish')}</span>
            <span className="sm:hidden">{redirecting ? '✓' : saving ? '…' : (mode === 'edit' ? '✓' : '+')}</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3 animate-slide-down">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700">Something needs attention</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Draft restored banner */}
        {draftRestored && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 mb-6 flex items-center gap-3 animate-slide-down">
            <span className="text-lg">📝</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">Draft restored</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Your unsaved work from {draftSavedAt ? draftSavedAt.toLocaleString() : 'earlier'} has been restored.
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem(draftKey);
                setImages([]); setName(''); setPrice(''); setComparePrice('');
                setDescription(''); setDetails([]); setSizes([]); setTag('');
                setFeatured(false); setInStock(true); setDraftRestored(false);
              }}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 underline whitespace-nowrap"
            >
              Start fresh
            </button>
            <button onClick={() => setDraftRestored(false)} className="text-amber-400 hover:text-amber-700 ml-1">
              <X size={15} />
            </button>
          </div>
        )}

        {/* Autosave indicator */}
        {draftSavedAt && !draftRestored && (
          <div className="flex items-center justify-end gap-1.5 mb-4 bg-green-50 border border-green-100 rounded-xl px-4 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-[11px] text-green-700 font-bold">
              ✓ Your changes are being saved automatically
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8">

          {/* ═══════════ LEFT: FORM ═══════════ */}
          <div className="space-y-5">

            {/* 1. PHOTOS */}
            <Section number={1} title="Product Photos" sub="Up to 5 photos. The first will be the main image." icon={ImageIcon} required>
              <ImageUpload value={images} onChange={setImages} />
            </Section>

            {/* 2. BASIC INFO */}
            <Section number={2} title="Basic Info" sub="What's it called and how much?" icon={Type} required>
              <div className="space-y-4">
                
                <Field label="Product Name" required>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Floral Summer Dress"
                    className="premium-input"
                  />
                </Field>

                <Field label="Custom Link (Optional)" hint="Leave blank to auto-generate from the name.">
                  <div className="flex items-center">
                    <span className="bg-gray-100 border border-r-0 border-gray-200 text-gray-500 text-xs px-3 py-[15px] rounded-l-xl select-none">
                      /products/
                    </span>
                    <input
                      type="text"
                      value={customSlug || (name ? generateSlug(name) : '')}
                      onChange={(e) => {
                        setCustomSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                      }}
                      placeholder="my-custom-link"
                      className="w-full px-3 py-3.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-xl outline-none focus:border-[#C8102E] focus:ring-4 focus:ring-[#C8102E]/10 transition-all"
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Price (Ghana Cedis)" required icon={DollarSign}>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500 pointer-events-none">GHS</span>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="150"
                        min="0"
                        step="any"
                        className="premium-input" style={{ paddingLeft: '3.5rem' }}
                      />
                    </div>
                  </Field>
                  <Field label="Was / Crossed-out Price" hint="Only fill this if the item is on sale">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500 pointer-events-none">GHS</span>
                      <input
                        type="number"
                        value={comparePrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          setComparePrice(val);
                          // Auto-apply Sale tag when a valid compare price is entered
                          if (val && Number(val) > Number(price) && Number(price) > 0) {
                            setTag('Sale');
                          } else if (tag === 'Sale' && !val) {
                            setTag('');
                          }
                        }}
                        placeholder="200"
                        min="0"
                        step="any"
                        className="premium-input" style={{ paddingLeft: '3.5rem' }}
                      />
                    </div>
                  </Field>
                </div>
                {comparePrice && Number(comparePrice) > Number(price) && Number(price) > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-100 rounded-lg animate-slide-down">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-burgundy text-white px-2 py-0.5 rounded-full">
                      -{Math.round(((Number(comparePrice) - Number(price)) / Number(comparePrice)) * 100)}%
                    </span>
                    <span className="text-xs text-gray-700 font-medium">
                      Customers save GHS {(Number(comparePrice) - Number(price)).toLocaleString()}. Sale label applied automatically.
                    </span>
                  </div>
                )}
              </div>
            </Section>

            {/* 3. CATEGORY */}
            <Section number={3} title="Category" sub="Pick the category this product belongs to. The hint shows what each category covers." icon={Layers} required>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const active = category === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className={`flex flex-col items-start gap-1.5 p-3.5 rounded-2xl border-2 transition-all duration-200 active:scale-95 text-left ${
                        active
                          ? 'border-burgundy bg-gradient-to-br from-burgundy/5 to-burgundy/10 shadow-md shadow-burgundy/10'
                          : 'border-gray-200 bg-white hover:border-burgundy/30 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        active ? 'bg-burgundy text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Icon size={16} strokeWidth={2} />
                      </div>
                      <span className={`text-xs font-bold leading-tight ${active ? 'text-burgundy' : 'text-gray-700'}`}>
                        {c.label}
                      </span>
                      <span className="text-[10px] text-gray-400 leading-tight font-normal">
                        {c.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* 4. DESCRIPTION & MATERIAL */}
            <Section number={4} title="Description & Material" sub="What it is, and what it's made of." icon={FileText}>
              <div className="space-y-4">
                {/* AI button — prominent card */}
                <button
                  type="button"
                  onClick={() => setShowAI(true)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-amber-200 bg-gradient-to-r from-amber-50 to-rose-50 hover:border-amber-400 hover:from-amber-100 hover:to-rose-100 transition-all group active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-black text-gray-900">Write with AI ✨</p>
                    <p className="text-xs text-gray-500 mt-0.5">Tap to generate a description from your product name & category</p>
                  </div>
                  {aiNote && (
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full flex-shrink-0">Generated ✓</span>
                  )}
                </button>
                <textarea
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setAiNote(false); }}
                  placeholder="Or type your description here…"
                  rows={4}
                  className="premium-input resize-none"
                />
                <div className="flex items-center justify-end">
                  <span className={`text-[10px] font-semibold ${description.length > 500 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {description.length} chars
                  </span>
                </div>

                {/* ✨ SMART MATERIAL FIELD */}
                <div className="pt-4 border-t border-gray-100">
                  <Field label="Material / Fabric" hint="Click a suggestion or type your own">
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="e.g. 100% Egyptian Cotton"
                      className="premium-input"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['100% Cotton', 'Genuine Leather', 'Silk', 'Denim', 'Gold Plated', 'Stainless Steel'].map((ex) => (
                        <button
                          key={ex}
                          type="button"
                          onClick={() => setMaterial(ex)}
                          className="text-[11px] px-3 py-1 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-burgundy hover:bg-rose-50 hover:text-burgundy transition-all"
                        >
                          + {ex}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              </div>
            </Section>

            {/* 5. DETAILS */}
            <Section number={5} title="Bullet Details" sub="Each line shows as a bullet point on the product page. Think: material, care instructions, sizing notes." icon={ListChecks} optional>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 mb-1">
                  {['100% cotton', 'Hand wash only', 'Made in Ghana', 'True to size'].map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => { if (!details.includes(ex)) setDetails([...details, ex]); }}
                      className="text-[11px] px-3 py-1 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-burgundy hover:text-burgundy transition-all"
                    >
                      + {ex}
                    </button>
                  ))}
                </div>
                <TagInput value={details} onChange={setDetails} />
              </div>
            </Section>

            {/* 6. SIZES */}
            <Section number={6} title="Available Sizes" sub="Tap a preset to add sizes instantly. Only fill this if customers need to pick a size." icon={Ruler} optional>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {SIZE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSizes(preset.sizes)}
                      className="text-[11px] font-bold px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-burgundy hover:text-burgundy hover:bg-rose-50/50 transition-all"
                    >
                      + {preset.label}
                    </button>
                  ))}
                  {sizes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSizes([])}
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-3.5 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={11} /> Clear
                    </button>
                  )}
                </div>
                {sizes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSizes(sizes.filter((x) => x !== s))}
                        className="text-[11px] font-black px-3 py-1.5 bg-burgundy text-white rounded-full flex items-center gap-1.5 hover:bg-burgundy-light transition-colors group"
                      >
                        {s}
                        <X size={10} strokeWidth={3} className="text-white/70 group-hover:text-white" />
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowCustomSize(!showCustomSize)}
                  className="text-[11px] font-bold text-gray-400 hover:text-burgundy underline transition-colors"
                >
                  {showCustomSize ? '− Hide custom size input' : '+ Add a custom size'}
                </button>
                {showCustomSize && <TagInput value={sizes} onChange={setSizes} />}
              </div>
            </Section>
            {/* COLORS */}
            <Section number={6.5} title="Available Colors" sub="Type a color and press Enter, or click a suggestion below." icon={Palette} optional>
              <div className="space-y-3">
                <TagInput value={colors} onChange={setColors} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Black', 'White', 'Navy Blue', 'Red', 'Gold', 'Silver', 'Brown'].map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => { if (!colors.includes(ex)) setColors([...colors, ex]); }}
                      className="text-[11px] px-3 py-1 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-burgundy hover:bg-rose-50 hover:text-burgundy transition-all"
                    >
                      + {ex}
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            {/* 7. TAG */}
            <Section number={7} title="Special Label" sub="Show a badge on the product card to draw attention." icon={TagIcon} optional>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TAGS.map((t) => {
                  const Icon = t.icon;
                  const active = tag === t.value;
                  return (
                    <button
                      key={t.value || 'none'}
                      type="button"
                      onClick={() => setTag(t.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                        active
                          ? 'border-burgundy bg-rose-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {Icon ? (
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          active ? 'bg-burgundy text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Icon size={13} strokeWidth={2} />
                        </div>
                      ) : (
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          active ? 'bg-burgundy text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <span className="text-xs">—</span>
                        </div>
                      )}
                      <span className={`text-[10px] font-black ${active ? 'text-burgundy' : 'text-gray-600'}`}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* 8. SETTINGS */}
            <Section number={8} title="Visibility & Stock" sub="Control how this product appears on your store." icon={SettingsIcon}>
              <div className="space-y-4">
                <div className="space-y-2.5">
                  <ToggleRow
                    active={featured}
                    onToggle={() => setFeatured(!featured)}
                    title="Show on homepage"
                    desc='Appears in the "Featured Pieces" section.'
                    icon={Star}
                  />
                  <ToggleRow
                    active={inStock}
                    onToggle={() => setInStock(!inStock)}
                    title="Available to order"
                    desc="Customers can only order in-stock items."
                    icon={Box}
                    greenWhenOn
                  />
                </div>

                {inStock && (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 animate-slide-down">
                    <Field 
                      label="Low Stock Warning (Optional)" 
                      hint="Type a low number (e.g. 3) to show an 'Only 3 left!' badge and create urgency."
                      icon={Flame}
                    >
                      <input
                        type="number"
                        min="1"
                        placeholder="Leave blank for infinite stock"
                        value={stockCount}
                        onChange={(e) => setStockCount(e.target.value)}
                        className="w-full sm:w-1/2 px-4 py-3 bg-white border border-amber-200 rounded-xl outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all text-sm font-medium text-gray-900"
                      />
                    </Field>
                  </div>
                )}
              </div>
            </Section>

            {/* Delete button (edit mode only) */}
            {mode === 'edit' && (
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowDangerZone(!showDangerZone)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Advanced options</span>
                  <X size={14} className={`text-gray-300 transition-transform duration-200 ${showDangerZone ? 'rotate-0' : 'rotate-45'}`} />
                </button>
                {showDangerZone && (
                  <div className="bg-red-50 border-t border-red-100 px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm font-black text-red-700 mb-1">Delete this product</p>
                      <p className="text-xs text-red-600">This cannot be undone. Be sure before you tap.</p>
                    </div>
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-100 px-4 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95"
                    >
                      <Trash2 size={13} /> Delete Product
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bottom publish CTA */}
            <div className="bg-white rounded-2xl border border-bone shadow-lux-1 px-5 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-ink">Ready to go live?</p>
                <p className="text-xs text-ink-500 mt-0.5">Double-check your photos and price, then hit publish.</p>
              </div>
              <button
                onClick={() => save()}
                disabled={saving || redirecting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-ink via-burgundy to-ink bg-[length:200%_100%] hover:bg-[100%_0] text-white text-xs font-black tracking-[0.2em] uppercase px-8 py-4 rounded-xl active:scale-95 transition-all duration-500 ease-lux disabled:opacity-50 shadow-lux-2 hover:shadow-lux-3"
              >
                <Save size={14} strokeWidth={2.5} />
                {redirecting ? 'Saved! Redirecting…' : saving ? 'Saving…' : (mode === 'edit' ? 'Save Changes' : 'Publish Product')}
              </button>
            </div>

          </div>{/* ── end LEFT column ── */}

          {/* ═══════════ RIGHT: LIVE PREVIEW (sticky) ═══════════ */}
          <aside className={`
            lg:sticky lg:top-24 lg:self-start lg:block
            ${showPreview
              ? 'fixed inset-x-4 top-20 z-50 block rounded-2xl shadow-2xl'
              : 'hidden lg:block'
            }
          `}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
              <div className="bg-gradient-to-r from-burgundy to-burgundy-light text-white px-5 py-3 flex items-center gap-2">
                <Eye size={14} strokeWidth={2.5} />
                <p className="text-[11px] font-black tracking-[0.15em] uppercase">Live Preview</p>
                <span className="ml-auto text-[10px] text-white/70">As customers see it</span>
                <button
                  onClick={() => setShowPreview(false)}
                  className="lg:hidden ml-2 text-white/70 hover:text-white transition-colors"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
              <div className="p-5">
                <PreviewCard
                  comparePrice={comparePrice}
                  images={images}
                  name={name || 'Product Name'}
                  price={price}
                  category={category}
                  tag={tag}
                  inStock={inStock}
                  featured={featured}
                  sizes={sizes}
                />
              </div>
              {/* Quick stats */}
              <div className="border-t border-gray-100 px-5 py-3.5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="font-bold text-gray-600">{inStock ? 'In stock' : 'Out of stock'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star size={11} className={featured ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                  <span className="font-bold text-gray-600">{featured ? 'Featured' : 'Not featured'}</span>
                </div>
              </div>
            </div>
          </aside>{/* ── end RIGHT column ── */}

        </div>{/* ── end grid ── */}
      </div>{/* ── end max-w-7xl ── */}

      {/* Backdrop for mobile preview */}
      {showPreview && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setShowPreview(false)}
        />
      )}

      {/* AI Modal */}
      {showAI && (
        <AIDescriptionModal
          productName={name}
          category={category}
          onClose={() => setShowAI(false)}
          onGenerated={(text) => { setDescription(text); setAiNote(true); }}
        />
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Trash2 size={22} className="text-red-500" strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 text-center mb-2">Delete this product?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              <strong className="text-gray-900">{product?.name}</strong> will be permanently removed. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmDelete(false); setDeleteError(''); }}
                className="flex-1 border border-gray-200 text-gray-700 font-bold text-sm py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteProduct}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white font-black text-sm py-3 rounded-xl hover:bg-red-600 active:scale-95 transition-all disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
            {deleteError && (
              <p className="text-xs text-red-500 font-medium text-center mt-3">{deleteError}</p>
            )}
          </div>
        </div>
      )}

      {/* Premium input styling */}
      <style jsx global>{`
        .premium-input {
          width: 100%;
          padding: 0.875rem 1rem;
          font-size: 0.9375rem;
          font-weight: 500;
          color: #1A0B0E;
          background: #FCFAF6;
          border: 1.5px solid #EDE5DD;
          border-radius: 0.875rem;
          outline: none;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .premium-input::placeholder { color: #A89A9D; font-weight: 400; }
        .premium-input:hover { border-color: #E0D4C7; background: #FFFFFF; }
        .premium-input:focus {
          background: #FFFFFF;
          border-color: #C8102E;
          box-shadow: 0 0 0 4px rgba(107, 39, 55, 0.08);
        }
      `}</style>
    </div>
  );
}

/* ─── Section wrapper ─── */
function Section({
  number, title, sub, icon: Icon, required, optional, children,
}: {
  number: number; title: string; sub?: string;
  icon: LucideIcon;
  required?: boolean; optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-bone shadow-lux-1 hover:shadow-lux-2 transition-shadow duration-500 ease-lux overflow-hidden">
      <div className="px-5 sm:px-6 pt-5 pb-4 flex items-start gap-3 border-b border-bone/60">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-burgundy to-burgundy-light flex items-center justify-center text-white font-black text-xs flex-shrink-0 shadow-lux-1 ring-1 ring-burgundy-dark/20">
          {number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Icon size={14} strokeWidth={2} className="text-ink-300" />
            <h2 className="text-base font-black text-ink tracking-editorial">{title}</h2>
            {required && <span className="text-[9px] font-bold bg-rose-soft text-burgundy px-2 py-0.5 rounded-full uppercase tracking-[0.18em]">Required</span>}
            {optional && <span className="text-[9px] font-bold bg-bone text-ink-500 px-2 py-0.5 rounded-full uppercase tracking-[0.18em]">Optional</span>}
          </div>
          {sub && <p className="text-xs text-ink-500 mt-1 leading-relaxed">{sub}</p>}
        </div>
      </div>
      <div className="px-5 sm:px-6 py-5">{children}</div>
    </div>
  );
}

/* ─── Field wrapper ─── */
function Field({ label, required, hint, icon: Icon, children }: {
  label: string; required?: boolean; hint?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-black tracking-wider uppercase text-gray-700 mb-1">
        {Icon && <Icon size={11} strokeWidth={2.5} className="text-gray-400" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-[11px] text-gray-400 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

/* ─── Toggle row ─── */
function ToggleRow({
  active, onToggle, title, desc, icon: Icon, greenWhenOn,
}: {
  active: boolean; onToggle: () => void; title: string; desc: string;
  icon: LucideIcon;
  greenWhenOn?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center justify-between gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
        active
          ? greenWhenOn
            ? 'border-green-200 bg-green-50/50'
            : 'border-burgundy bg-rose-50/50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          active
            ? greenWhenOn ? 'bg-green-500 text-white' : 'bg-burgundy text-white'
            : 'bg-gray-100 text-gray-400'
        }`}>
          <Icon size={16} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-gray-900 truncate">{title}</p>
          <p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>
        </div>
      </div>
      <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
        active ? (greenWhenOn ? 'bg-green-500' : 'bg-burgundy') : 'bg-gray-300'
      }`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
          active ? 'left-[22px]' : 'left-0.5'
        }`} />
      </div>
    </button>
  );
}

/* ─── Live preview card ─── */
function PreviewCard({
  images, name, price, comparePrice, category, tag, inStock, sizes,
}: {
  images: string[]; name: string; price: string; comparePrice?: string; category: Category;
  tag: ProductTag; inStock: boolean; featured: boolean; sizes: string[];
}) {
  const previewImage = images[0] || `https://picsum.photos/seed/preview/400/533`;
  const priceNum = Number(price) || 0;
  const compareNum = comparePrice ? Number(comparePrice) : 0;
  const onSale = compareNum > priceNum && priceNum > 0;
  const discountPct = onSale ? Math.round(((compareNum - priceNum) / compareNum) * 100) : 0;

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden">
      <div className="relative aspect-[4/5] lg:aspect-[3/4] bg-gray-200">
        {images[0] ? (
          <Image src={previewImage} alt={name} fill sizes="400px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
            <ImageIcon size={36} strokeWidth={1} />
            <p className="text-[10px] font-bold mt-2 uppercase tracking-wider">No image yet</p>
          </div>
        )}
        {onSale && (
          <span className="absolute top-3 left-3 text-[10px] font-black px-3 py-1.5 tracking-[0.18em] uppercase rounded-full bg-burgundy text-white shadow-md">
            -{discountPct}%
          </span>
        )}
        {tag && !onSale && (
          <span className={`absolute top-3 left-3 text-[9px] font-bold px-2.5 py-1 tracking-wider uppercase rounded-full shadow-sm ${TAG_PILL_STYLE[tag] ?? 'bg-gray-900 text-white'}`}>
            {tag}
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[10px] font-bold tracking-wider uppercase text-gray-900 bg-white px-4 py-2 rounded-full shadow-md">
              Sold Out
            </span>
          </div>
        )}
        {sizes.length > 0 && inStock && (
          <div className="absolute bottom-3 left-3 text-[10px] font-bold bg-white/90 backdrop-blur-sm text-gray-700 px-2.5 py-1 rounded-full shadow-sm">
            {sizes.length} sizes
          </div>
        )}
      </div>
      <div className="p-3 bg-white">
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </p>
        <p className="text-sm font-bold text-gray-900 line-clamp-1 mb-1.5">{name}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-base font-black text-gray-900">
            {priceNum > 0 ? formatPrice(priceNum) : 'GHS 0'}
          </p>
          {onSale && (
            <p className="text-[11px] text-gray-400 line-through font-medium">{formatPrice(compareNum)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

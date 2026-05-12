'use client';

import { useEffect, useState } from 'react';
import {
  Plus, Tag, Trash2, Edit3, Calendar, Hash, Percent, DollarSign,
  X, Check, AlertCircle, Sparkles, Copy, XCircle,
} from 'lucide-react';
import { Discount, DiscountType } from '@/types';
import { toast } from '@/components/ui/Toast';
import AdminShell, { StatCard } from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/Button';

interface FormState {
  code: string;
  type: DiscountType;
  value: string;
  min_order: string;
  max_uses: string;
  expires_at: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  code: '', type: 'percent', value: '', min_order: '0',
  max_uses: '', expires_at: '', description: '',
};

export default function AdminDiscountsPage() {
  const [items, setItems] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Discount | null>(null);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/discounts', { cache: 'no-store' });
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      toast.error('Could not load discounts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(d: Discount) {
    setEditing(d);
    setForm({
      code: d.code,
      type: d.type,
      value: d.value.toString(),
      min_order: (d.min_order ?? 0).toString(),
      max_uses: d.max_uses?.toString() ?? '',
      expires_at: d.expires_at ? d.expires_at.split('T')[0] : '',
      description: d.description ?? '',
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.code.trim()) { toast.error('Code is required'); return; }
    if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0) {
      toast.error('Value must be a positive number'); return;
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        min_order: Number(form.min_order || 0),
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        // Ghana is UTC+0 — append explicit UTC end-of-day so the code is valid all day in Ghana
        expires_at: form.expires_at ? `${form.expires_at}T23:59:59.000Z` : null,
        description: form.description.trim() || null,
        active: true,
      };

      const res = await fetch('/api/admin/discounts', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      toast.success(editing ? 'Discount updated' : 'Discount created');
      setShowForm(false);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(d: Discount) {
    try {
      await fetch('/api/admin/discounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: d.id, active: !d.active }),
      });
      setItems((prev) => prev.map((i) => i.id === d.id ? { ...i, active: !d.active } : i));
      toast.success(d.active ? 'Code disabled' : 'Code activated');
    } catch {
      toast.error('Could not update');
    }
  }

  async function doDelete(d: Discount) {
    try {
      await fetch('/api/admin/discounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: d.id }),
      });
      setItems((prev) => prev.filter((i) => i.id !== d.id));
      toast.success('Discount deleted');
    } catch {
      toast.error('Could not delete');
    } finally {
      setConfirmDelete(null);
    }
  }

  // ─── EXPIRY COUNTDOWN ───
  function expiryCountdown(expiresAt: string): string {
    const now = new Date();
    const exp = new Date(expiresAt);
    const diffMs = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `${diffDays} days left`;
  }

  function copyCode(code: string) {
    navigator.clipboard?.writeText(code);
    toast.success('Code copied!');
  }

  const active = items.filter((i) => i.active);
  const total = items.length;

  return (
    <AdminShell
      subtitle="Promotions"
      title="Discount Codes"
      actions={
        <Button onClick={openNew} variant="dark" size="md" iconLeft={<Plus size={13} strokeWidth={2.5} />}>
          New Code
        </Button>
      }
    >
      <div className="space-y-6">

        {/* ─── STATS GRID ─── */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
          <StatCard
            label="Total Codes"
            value={loading ? 0 : total}
            icon={Tag}
            gradient="from-burgundy via-burgundy-light to-burgundy-dark"
          />
          <StatCard
            label="Active"
            value={loading ? 0 : active.length}
            icon={Check}
            gradient="from-emerald-500 via-emerald-600 to-green-700"
          />
          <StatCard
            label="Inactive"
            value={loading ? 0 : total - active.length}
            icon={XCircle}
            gradient="from-rose-400 via-rose-500 to-red-600"
          />
        </div>

        {/* ─── LIST ─── */}
        <div className="bg-white rounded-2xl border border-bone shadow-lux-1 overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-bone flex items-center justify-between">
            <h2 className="font-black text-ink text-base">All Promo Codes</h2>
            <span className="text-xs text-ink-400 font-bold">{items.length} total</span>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-bone rounded-xl animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-soft to-champagne-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-burgundy" />
              </div>
              <p className="font-black text-xl text-ink mb-1 tracking-editorial">No codes yet</p>
              <p className="text-sm text-ink-500 mb-6">Create your first discount code to drive sales.</p>
              <Button onClick={openNew} variant="primary" size="md" iconLeft={<Plus size={13} strokeWidth={2.5} />}>
                Create First Code
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-bone">
              {items.map((d) => {
                const expired = d.expires_at && new Date(d.expires_at) < new Date();
                const exhausted = d.max_uses !== null && d.used_count >= d.max_uses;
                const broken = !d.active || expired || exhausted;
                return (
                  <div key={d.id} className="p-4 sm:p-5 hover:bg-champagne-100/40 transition-colors flex items-center gap-3 sm:gap-4 flex-wrap group">
                    {/* Code badge */}
                    <button
                      onClick={() => copyCode(d.code)}
                      className={`relative flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed font-black text-sm tracking-wider uppercase transition-all ${
                        broken
                          ? 'border-bone bg-gray-50 text-ink-400'
                          : 'border-burgundy/30 bg-rose-soft text-burgundy hover:border-burgundy hover:scale-105 shadow-sm'
                      }`}
                    >
                      <Tag size={13} strokeWidth={2.5} />
                      {d.code}
                      <Copy size={11} className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-1.5 top-1.5 text-burgundy" />
                    </button>

                    {/* Value badge */}
                    <div className="flex items-center gap-1.5 text-sm font-black text-ink">
                      {d.type === 'percent' ? <Percent size={13} className="text-ink-400" /> : <DollarSign size={13} className="text-ink-400" />}
                      {d.type === 'percent' ? `${d.value}% OFF` : `GHS ${d.value} OFF`}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-2 flex-1 min-w-0 text-[10px] font-bold">
                      {d.min_order > 0 && (
                        <span className="bg-bone text-ink px-2.5 py-1 rounded-full">
                          Min GHS {d.min_order}
                        </span>
                      )}
                      {d.max_uses !== null && (
                        <span className="bg-bone text-ink px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <Hash size={10} /> {d.used_count}/{d.max_uses} used
                        </span>
                      )}
                      {d.expires_at && (
                        <span className={`px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${expired ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                          <Calendar size={10} />
                          Expires {new Date(d.expires_at).toLocaleDateString()} · {expiryCountdown(d.expires_at)}
                        </span>
                      )}
                      {exhausted && <span className="bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full">Maxed out</span>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => toggleActive(d)}
                        title={d.active ? 'Disable' : 'Activate'}
                        className={`relative w-11 h-6 rounded-full transition-all ${d.active ? 'bg-emerald-500' : 'bg-bone'}`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${d.active ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                      <button
                        onClick={() => openEdit(d)}
                        className="p-2 text-ink-300 hover:text-burgundy hover:bg-rose-soft rounded-lg transition-all"
                      >
                        <Edit3 size={14} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(d)}
                        className="p-2 text-ink-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── FORM MODAL ─── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center px-0 sm:px-4 animate-fade-in" onClick={() => setShowForm(false)}>
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-lux-3 animate-slide-up max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-bone">
              <h3 className="font-black text-ink text-lg tracking-editorial">{editing ? 'Edit Code' : 'New Discount Code'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 text-ink-400 hover:text-ink rounded-lg hover:bg-bone transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">

              <div>
                <label className="text-[10px] font-black tracking-[0.2em] uppercase text-ink-500 mb-1.5 block">Code *</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER25"
                  className="w-full px-4 py-3.5 text-lg font-black tracking-wider uppercase bg-champagne-100/50 border border-bone rounded-xl focus:outline-none focus:bg-white focus:border-burgundy focus:ring-4 focus:ring-burgundy/10 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black tracking-[0.2em] uppercase text-ink-500 mb-1.5 block">Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['percent', 'fixed'] as DiscountType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`p-3.5 rounded-xl border-2 transition-all duration-300 ${
                        form.type === t
                          ? 'border-burgundy bg-rose-soft text-burgundy'
                          : 'border-bone bg-white text-ink hover:border-burgundy/30'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {t === 'percent' ? <Percent size={14} strokeWidth={2.5} /> : <DollarSign size={14} strokeWidth={2.5} />}
                        <span className="text-xs font-black uppercase tracking-wider">
                          {t === 'percent' ? 'Percent off' : 'Fixed GHS'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black tracking-[0.2em] uppercase text-ink-500 mb-1.5 block">
                  {form.type === 'percent' ? 'Discount %' : 'Discount Amount (GHS)'} *
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder={form.type === 'percent' ? '25' : '50'}
                  className="w-full px-4 py-3.5 bg-champagne-100/50 border border-bone rounded-xl focus:outline-none focus:bg-white focus:border-burgundy focus:ring-4 focus:ring-burgundy/10 transition-all font-black text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black tracking-[0.2em] uppercase text-ink-500 mb-1.5 block">Min Order (GHS)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.min_order}
                    onChange={(e) => setForm({ ...form, min_order: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-champagne-100/50 border border-bone rounded-xl focus:outline-none focus:bg-white focus:border-burgundy transition-all text-sm font-bold text-ink"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-[0.2em] uppercase text-ink-500 mb-1.5 block">Max Uses</label>
                  <input
                    type="number"
                    min="0"
                    value={form.max_uses}
                    onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full px-4 py-3 bg-champagne-100/50 border border-bone rounded-xl focus:outline-none focus:bg-white focus:border-burgundy transition-all text-sm font-bold text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black tracking-[0.2em] uppercase text-ink-500 mb-1.5 block">Expires (optional)</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full px-4 py-3 bg-champagne-100/50 border border-bone rounded-xl focus:outline-none focus:bg-white focus:border-burgundy transition-all text-sm font-bold text-ink"
                />
              </div>

              <div>
                <label className="text-[10px] font-black tracking-[0.2em] uppercase text-ink-500 mb-1.5 block">Description (internal)</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Summer sale 2026"
                  className="w-full px-4 py-3 bg-champagne-100/50 border border-bone rounded-xl focus:outline-none focus:bg-white focus:border-burgundy transition-all text-sm font-bold text-ink"
                />
              </div>

              {/* Preview */}
              {form.code && form.value && (
                <div className="bg-rose-soft border border-burgundy/20 rounded-xl p-4 mt-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-burgundy mb-2">Preview</p>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-2 bg-white border border-dashed border-burgundy rounded-lg font-black text-sm tracking-wider uppercase text-burgundy shadow-sm">
                      {form.code}
                    </div>
                    <p className="text-sm font-bold text-ink">
                      {form.type === 'percent' ? `${form.value}% off` : `GHS ${form.value} off`}
                      {Number(form.min_order) > 0 && <span className="text-xs text-ink-400 ml-1">(min GHS {form.min_order})</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-bone px-6 py-5 flex gap-3 bg-champagne-100/30">
              <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={save} loading={saving} variant="primary" className="flex-[2]">
                {editing ? 'Update Code' : 'Create Code'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRM MODAL ─── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-lux-3 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertCircle size={22} className="text-red-500" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black text-ink text-center mb-2 tracking-editorial">Delete this code?</h3>
            <p className="text-sm text-ink-500 text-center mb-6">
              <strong className="text-ink">{confirmDelete.code}</strong> will be removed permanently.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-bone text-ink font-bold text-sm py-3 rounded-xl hover:bg-bone transition-colors">
                Cancel
              </button>
              <button onClick={() => doDelete(confirmDelete)} className="flex-1 bg-red-500 text-white font-black text-sm py-3 rounded-xl hover:bg-red-600 active:scale-95 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

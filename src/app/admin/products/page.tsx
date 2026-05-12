'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package, CheckCircle, XCircle, Plus, Trash2, Edit3,
  Search, X, TrendingUp, Copy, QrCode,
  CheckSquare, Square, ArrowUpRight, AlertTriangle,
  ArrowUpDown, ArrowUp, ArrowDown, Eye,
} from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, generateSlug } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import AdminShell, { StatCard } from '@/components/admin/AdminShell';
import QRCodeModal from '@/components/admin/QRCodeModal';
import { Button } from '@/components/ui/Button';

// ─── TYPES ───
type SortKey = 'name' | 'price' | 'category' | 'created_at';
type SortDir = 'asc' | 'desc';
type Filter = 'all' | 'in_stock' | 'out_of_stock' | 'featured' | 'sale' | 'low_stock';

// ─── INLINE PRICE EDITOR ───
function InlinePriceEditor({
  product,
  onSave,
}: {
  product: Product;
  onSave: (id: string, price: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(product.price.toString());
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const num = Number(value);
    if (isNaN(num) || num <= 0) { setEditing(false); setValue(product.price.toString()); return; }
    if (num === product.price) { setEditing(false); return; }
    setSaving(true);
    await onSave(product.id, num);
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-ink-400">₵</span>
          <input
            autoFocus
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') { setEditing(false); setValue(product.price.toString()); }
            }}
            onBlur={handleSave}
            className="w-24 pl-5 pr-2 py-1.5 text-xs font-black text-ink border-2 border-burgundy rounded-lg outline-none bg-white shadow-sm"
          />
        </div>
        {saving && <span className="w-3 h-3 border-2 border-burgundy border-t-transparent rounded-full animate-spin flex-shrink-0" />}
      </div>
    );
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      title="Click to edit price"
      className="group flex flex-col items-start hover:bg-rose-soft/60 rounded-lg px-1.5 py-1 -mx-1.5 -my-1 transition-all"
    >
      <span className="text-sm font-black text-ink tabular-nums group-hover:text-burgundy transition-colors">
        {formatPrice(product.price)}
      </span>
      {product.compare_price && product.compare_price > product.price && (
        <span className="text-[10px] text-ink-300 line-through tabular-nums">
          {formatPrice(product.compare_price)}
        </span>
      )}
      <span className="text-[9px] text-burgundy/0 group-hover:text-burgundy/70 font-bold uppercase tracking-wider transition-all leading-none mt-0.5">
        tap to edit
      </span>
    </button>
  );
}

// ─── SORT HEADER ───
function SortHeader({
  label, sortKey, currentKey, currentDir, onSort,
}: {
  label: string; sortKey: SortKey; currentKey: SortKey; currentDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = currentKey === sortKey;
  return (
    <button onClick={() => onSort(sortKey)} className="flex items-center gap-1 group text-left">
      <span className={`text-[10px] font-black tracking-[0.2em] uppercase transition-colors ${active ? 'text-burgundy' : 'text-ink-500 group-hover:text-ink'}`}>
        {label}
      </span>
      <span className="text-ink-300 group-hover:text-ink-500 transition-colors">
        {active
          ? currentDir === 'asc'
            ? <ArrowUp size={10} strokeWidth={2.5} className="text-burgundy" />
            : <ArrowDown size={10} strokeWidth={2.5} className="text-burgundy" />
          : <ArrowUpDown size={10} strokeWidth={2} />
        }
      </span>
    </button>
  );
}

// ─── LOW STOCK BADGE ───
function LowStockBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full animate-pulse">
      <AlertTriangle size={9} strokeWidth={2.5} />
      {count} left
    </span>
  );
}

// ─── MAIN PRODUCTS PAGE ───
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ ids: string[]; label: string } | null>(null);
  const [qrFor, setQrFor] = useState<Product | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [togglingStock, setTogglingStock] = useState<Set<string>>(new Set());

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setProducts(json.data ?? []);
    } catch {
      toast.error('Could not load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ─── STATS ───
  const total = products.length;
  const inStock = products.filter((p) => p.in_stock).length;
  const outOfStock = total - inStock;
  const featuredCount = products.filter((p) => p.featured).length;
  const onSaleCount = products.filter((p) => p.compare_price && p.compare_price > p.price).length;
  const lowStockCount = products.filter((p) => p.stock_count != null && p.stock_count <= 3 && p.stock_count > 0).length;

  // ─── FILTERED + SORTED ───
  const filtered = useMemo(() => {
    let list = [...products];
    if (filter === 'in_stock') list = list.filter((p) => p.in_stock);
    else if (filter === 'out_of_stock') list = list.filter((p) => !p.in_stock);
    else if (filter === 'featured') list = list.filter((p) => p.featured);
    else if (filter === 'sale') list = list.filter((p) => p.compare_price && p.compare_price > p.price);
    else if (filter === 'low_stock') list = list.filter((p) => p.stock_count != null && p.stock_count <= 3 && p.stock_count > 0);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';
      if (sortKey === 'name') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
      else if (sortKey === 'price') { valA = a.price; valB = b.price; }
      else if (sortKey === 'category') { valA = a.category; valB = b.category; }
      else if (sortKey === 'created_at') { valA = a.created_at; valB = b.created_at; }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [products, search, filter, sortKey, sortDir]);

  // ─── SORTING ───
  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  // ─── SELECTION ───
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  }

  const allSelected = filtered.length > 0 && selected.size === filtered.length;
  const someSelected = selected.size > 0 && !allSelected;

  // ─── TOGGLE STOCK ───
  async function toggleStock(product: Product) {
    setTogglingStock((prev) => new Set(prev).add(product.id));
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, in_stock: !product.in_stock }),
      });
      if (!res.ok) throw new Error();
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, in_stock: !p.in_stock } : p)
      );
      toast.success(product.in_stock ? 'Marked as out of stock' : 'Back in stock! 🎉');
    } catch {
      toast.error('Could not update stock');
    } finally {
      setTogglingStock((prev) => { const next = new Set(prev); next.delete(product.id); return next; });
    }
  }

  // ─── INLINE PRICE SAVE ───
  async function savePrice(id: string, price: number) {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, price }),
      });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, price } : p));
      toast.success('Price updated! 💰');
    } catch {
      toast.error('Could not update price');
    }
  }

  // ─── DUPLICATE ───
  async function duplicateProduct(p: Product) {
    try {
      const payload = {
        name: `${p.name} (Copy)`,
        slug: generateSlug(`${p.name} copy ${Date.now().toString(36)}`),
        category: p.category,
        price: p.price,
        compare_price: p.compare_price ?? null,
        description: p.description,
        details: p.details,
        sizes: p.sizes,
        images: p.images,
        tag: p.tag,
        featured: false,
        in_stock: p.in_stock,
      };
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      toast.success('Duplicated! ✨', `${p.name} has been copied.`);
      loadProducts();
    } catch {
      toast.error('Could not duplicate');
    }
  }

  // ─── BULK DELETE ───
  async function bulkDelete() {
    if (!confirmDelete) return;
    let success = 0; let failed = 0;
    for (const id of confirmDelete.ids) {
      try {
        const res = await fetch('/api/admin/products', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (res.ok) success++; else failed++;
      } catch { failed++; }
    }
    setProducts((prev) => prev.filter((p) => !confirmDelete.ids.includes(p.id)));
    setSelected(new Set());
    setConfirmDelete(null);
    if (success) toast.success(`${success} product${success === 1 ? '' : 's'} deleted`);
    if (failed) toast.error(`${failed} could not be deleted`);
  }

  return (
    <AdminShell
      subtitle="Catalogue"
      title="Products"
      actions={
        <Button
          href="/admin/products/new"
          variant="dark"
          size="md"
          iconLeft={<Plus size={13} strokeWidth={2.5} />}
        >
          New Product
        </Button>
      }
    >

      {/* ─── LOW STOCK ALERT ─── */}
      {!loading && lowStockCount > 0 && (
        <div className="mb-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-3 animate-slide-down">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={16} className="text-amber-600" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-black text-amber-900">
                {lowStockCount} product{lowStockCount > 1 ? 's are' : ' is'} running low on stock!
              </p>
              <p className="text-xs text-amber-700 mt-0.5">Restock soon to avoid missing orders.</p>
            </div>
          </div>
          <button
            onClick={() => setFilter('low_stock')}
            className="flex-shrink-0 flex items-center gap-1 text-xs font-black text-amber-700 hover:text-amber-900 uppercase tracking-wider"
          >
            View <ArrowUpRight size={12} />
          </button>
        </div>
      )}

      {/* ─── STATS STRIP ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <StatCard
          label="Total"
          value={loading ? 0 : total}
          sub="products"
          icon={Package}
          gradient="from-burgundy via-burgundy-light to-burgundy-dark"
          onClick={() => setFilter('all')}
          active={filter === 'all'}
        />
        <StatCard
          label="In Stock"
          value={loading ? 0 : inStock}
          sub={`${total > 0 ? Math.round((inStock / total) * 100) : 0}% available`}
          icon={CheckCircle}
          gradient="from-emerald-500 via-emerald-600 to-green-700"
          onClick={() => setFilter('in_stock')}
          active={filter === 'in_stock'}
        />
        <StatCard
          label="Out of Stock"
          value={loading ? 0 : outOfStock}
          sub="need restocking"
          icon={XCircle}
          gradient="from-rose-400 via-rose-500 to-red-600"
          onClick={() => setFilter('out_of_stock')}
          active={filter === 'out_of_stock'}
        />
        <StatCard
          label="Featured"
          value={loading ? 0 : featuredCount}
          sub="on homepage"
          icon={TrendingUp}
          gradient="from-amber-400 via-amber-500 to-orange-600"
          onClick={() => setFilter('featured')}
          active={filter === 'featured'}
        />
        <StatCard
          label="On Sale"
          value={loading ? 0 : onSaleCount}
          sub="with discount"
          icon={AlertTriangle}
          gradient="from-violet-500 via-purple-600 to-indigo-700"
          onClick={() => setFilter('sale')}
          active={filter === 'sale'}
        />
      </div>

      {/* ─── BULK ACTION BAR ─── */}
      {selected.size > 0 && (
        <div className="bg-gradient-to-r from-ink to-burgundy-dark rounded-2xl p-4 mb-4 flex items-center justify-between gap-3 shadow-lux-2 animate-slide-down">
          <div className="flex items-center gap-2.5 text-white min-w-0">
            <div className="w-8 h-8 bg-white/15 backdrop-blur rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckSquare size={14} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold truncate">{selected.size} selected</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs font-bold text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
            >
              Clear
            </button>
            <button
              onClick={() => setConfirmDelete({ ids: Array.from(selected), label: `${selected.size} products` })}
              className="flex items-center gap-1.5 bg-white text-red-600 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-lg active:scale-95 transition-all hover:shadow-md"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* ─── PRODUCTS TABLE ─── */}
      <div className="bg-white rounded-2xl border border-bone overflow-hidden shadow-lux-1">

        {/* Table header bar */}
        <div className="px-4 sm:px-6 py-4 border-b border-bone flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-black text-ink text-base">
              {filter === 'all' ? 'All Products' : filter.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </h3>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-[10px] font-black uppercase tracking-wider bg-rose-soft text-burgundy px-2.5 py-1 rounded-full hover:bg-rose-mid inline-flex items-center gap-1 transition-colors"
              >
                {filter.replace(/_/g, ' ')} <X size={10} />
              </button>
            )}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-champagne-100 border border-bone rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-burgundy focus-within:ring-4 focus-within:ring-burgundy/10 transition-all w-full sm:w-72">
            <Search size={14} className="text-ink-300 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or category..."
              className="flex-1 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink-300 min-w-0"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-ink-300 hover:text-ink transition-colors">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-5 h-5 bg-bone rounded" />
                <div className="w-12 h-12 bg-bone rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-bone rounded w-1/2" />
                  <div className="h-2 bg-bone rounded w-1/4" />
                </div>
                <div className="h-3 bg-bone rounded w-16 hidden sm:block" />
                <div className="h-6 bg-bone rounded-full w-10" />
                <div className="h-8 bg-bone rounded-xl w-24" />
              </div>
            ))}
          </div>

        ) : filtered.length === 0 ? (
          /* EMPTY STATE */
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-soft to-champagne-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={24} className="text-burgundy" />
            </div>
            <p className="font-black text-xl text-ink mb-1">
              {search ? `No matches for "${search}"` : 'No products yet'}
            </p>
            <p className="text-sm text-ink-500 mb-6">
              {search ? 'Try a different search term.' : 'Add your first product to get started.'}
            </p>
            {!search && (
              <Button
                href="/admin/products/new"
                variant="dark"
                size="md"
                iconLeft={<Plus size={13} strokeWidth={2.5} />}
              >
                Add Product
              </Button>
            )}
          </div>

        ) : (
          /* TABLE */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-bone bg-champagne-100/50">
                  {/* Checkbox */}
                  <th className="px-4 py-3 w-10">
                    <button
                      onClick={toggleAll}
                      className="text-ink-300 hover:text-burgundy transition-colors"
                      title={allSelected ? 'Deselect all' : 'Select all'}
                    >
                      {allSelected
                        ? <CheckSquare size={16} className="text-burgundy" strokeWidth={2.5} />
                        : someSelected
                          ? <CheckSquare size={16} className="text-ink-300" strokeWidth={2.5} />
                          : <Square size={16} strokeWidth={2} />
                      }
                    </button>
                  </th>
                  <th className="text-left px-4 py-3">
                    <SortHeader label="Product" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">
                    <SortHeader label="Category" sortKey="category" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="text-left px-4 py-3">
                    <SortHeader label="Price" sortKey="price" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="text-center px-4 py-3 text-[10px] font-black tracking-[0.2em] uppercase text-ink-500">Stock</th>
                  <th className="text-center px-4 py-3 text-[10px] font-black tracking-[0.2em] uppercase text-ink-500 hidden md:table-cell">Featured</th>
                  <th className="text-right px-6 py-3 text-[10px] font-black tracking-[0.2em] uppercase text-ink-500">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-bone">
                {filtered.map((p) => {
                  const isSel = selected.has(p.id);
                  const onSaleProduct = p.compare_price && p.compare_price > p.price;
                  const isLowStock = p.stock_count != null && p.stock_count <= 3 && p.stock_count > 0;
                  const isToggling = togglingStock.has(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors group ${isSel ? 'bg-rose-soft/30' : 'hover:bg-champagne-100/40'}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <button onClick={() => toggleOne(p.id)} className="text-ink-300 hover:text-burgundy transition-colors">
                          {isSel
                            ? <CheckSquare size={16} className="text-burgundy" strokeWidth={2.5} />
                            : <Square size={16} strokeWidth={2} />
                          }
                        </button>
                      </td>

                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-bone shadow-sm ring-1 ring-bone">
                            <Image
                              src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/48/48`}
                              alt={p.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                            {onSaleProduct && (
                              <span className="absolute top-0 left-0 right-0 bg-burgundy text-white text-[7px] font-black tracking-wider text-center py-0.5">
                                SALE
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="text-sm font-bold text-ink hover:text-burgundy transition-colors line-clamp-1 block"
                            >
                              {p.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {isLowStock && <LowStockBadge count={p.stock_count!} />}
                              {p.sizes && p.sizes.length > 0 && (
                                <p className="text-[10px] text-ink-300">{p.sizes.length} sizes</p>
                              )}
                              {p.tag && !onSaleProduct && (
                                <span className="text-[9px] font-bold text-burgundy">· {p.tag}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-soft text-burgundy px-2.5 py-1 rounded-full">
                          {p.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3">
                        <InlinePriceEditor product={p} onSave={savePrice} />
                      </td>

                      {/* Stock toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleStock(p)}
                          disabled={isToggling}
                          title={p.in_stock ? 'Mark as out of stock' : 'Mark as in stock'}
                          className={`relative w-11 h-6 rounded-full transition-all ${isToggling ? 'opacity-50 cursor-wait' : 'hover:opacity-90'} ${p.in_stock ? 'bg-emerald-500' : 'bg-bone'}`}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${p.in_stock ? 'left-[22px]' : 'left-0.5'}`} />
                        </button>
                      </td>

                      {/* Featured */}
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        {p.featured ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                            ★ Yes
                          </span>
                        ) : (
                          <span className="text-[10px] text-ink-300">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            title="View on store"
                            className="p-2 text-ink-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          >
                            <Eye size={14} strokeWidth={2} />
                          </Link>
                          <button
                            onClick={() => setQrFor(p)}
                            title="QR Code"
                            className="p-2 text-ink-300 hover:text-burgundy hover:bg-rose-soft rounded-lg transition-all"
                          >
                            <QrCode size={14} strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => duplicateProduct(p)}
                            title="Duplicate"
                            className="p-2 text-ink-300 hover:text-burgundy hover:bg-rose-soft rounded-lg transition-all"
                          >
                            <Copy size={14} strokeWidth={2} />
                          </button>
                          <Link
                            href={`/admin/products/${p.id}`}
                            title="Edit"
                            className="p-2 text-ink-300 hover:text-burgundy hover:bg-rose-soft rounded-lg transition-all"
                          >
                            <Edit3 size={14} strokeWidth={2} />
                          </Link>
                          <button
                            onClick={() => setConfirmDelete({ ids: [p.id], label: p.name })}
                            title="Delete"
                            className="p-2 text-ink-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={14} strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-bone bg-champagne-100/30 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-ink-500 font-bold">
              Showing <span className="text-ink">{filtered.length}</span> of <span className="text-ink">{total}</span> products
            </p>
            <div className="flex items-center gap-3">
              {selected.size === 0 && filtered.length > 1 && (
                <p className="text-[10px] text-ink-300 hidden sm:block">💡 Click a price to edit it instantly</p>
              )}
              {selected.size === 0 && (
                <p className="text-[10px] text-ink-300 hidden sm:block">· Select multiple to bulk-delete</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── QR MODAL ─── */}
      {qrFor && typeof window !== 'undefined' && (
        <QRCodeModal
          url={`${window.location.origin}/products/${qrFor.slug}`}
          productName={qrFor.name}
          productImage={qrFor.images?.[0]}
          onClose={() => setQrFor(null)}
        />
      )}

      {/* ─── DELETE CONFIRM ─── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-lux-3 animate-scale-in">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-ink text-center mb-2 tracking-editorial">
              {confirmDelete.ids.length > 1 ? `Delete ${confirmDelete.ids.length} products?` : 'Delete this product?'}
            </h3>
            <p className="text-sm text-ink-500 text-center mb-6">
              <strong className="text-ink">{confirmDelete.label}</strong> will be permanently removed. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-bone text-ink font-bold text-sm py-3 rounded-xl hover:bg-bone transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={bulkDelete}
                className="flex-1 bg-red-500 text-white font-black text-sm py-3 rounded-xl hover:bg-red-600 active:scale-95 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminShell>
  );
}

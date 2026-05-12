'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package, CheckCircle, XCircle, Plus, TrendingUp,
  ArrowUpRight, Sparkles, AlertTriangle, Tag, ShoppingBag, Users,
} from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import AdminShell, { StatCard } from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/Button';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setProducts(json.data ?? []);
    } catch {
      // silent fail — stats show zeros
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
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const avgPrice = total > 0 ? Math.round(totalValue / total) : 0;
  const categoriesCount = new Set(products.map((p) => p.category)).size;

  // 5 most recent products for the preview
  const recent = [...products]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  return (
    <AdminShell
      subtitle="Welcome back, Rahinatu 👋"
      title="Overview"
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
          <Link
            href="/admin/products"
            className="flex-shrink-0 flex items-center gap-1 text-xs font-black text-amber-700 hover:text-amber-900 uppercase tracking-wider"
          >
            View <ArrowUpRight size={12} />
          </Link>
        </div>
      )}

      {/* ─── MAIN STATS GRID ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        <StatCard
          label="Total"
          value={loading ? 0 : total}
          sub="products listed"
          icon={Package}
          gradient="from-burgundy via-burgundy-light to-burgundy-dark"
          onClick={() => { window.location.href = '/admin/products'; }}
        />
        <StatCard
          label="In Stock"
          value={loading ? 0 : inStock}
          sub={`${total > 0 ? Math.round((inStock / total) * 100) : 0}% available`}
          icon={CheckCircle}
          gradient="from-emerald-500 via-emerald-600 to-green-700"
          onClick={() => { window.location.href = '/admin/products'; }}
        />
        <StatCard
          label="Out of Stock"
          value={loading ? 0 : outOfStock}
          sub="need restocking"
          icon={XCircle}
          gradient="from-rose-400 via-rose-500 to-red-600"
          onClick={() => { window.location.href = '/admin/products'; }}
        />
        <StatCard
          label="Featured"
          value={loading ? 0 : featuredCount}
          sub="on homepage"
          icon={TrendingUp}
          gradient="from-amber-400 via-amber-500 to-orange-600"
          onClick={() => { window.location.href = '/admin/products'; }}
        />
      </div>

      {/* ─── SECONDARY STATS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-bone p-4 sm:p-5 hover:shadow-lux-1 transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={12} className="text-gold" />
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-ink-300">On Sale</p>
          </div>
          <p className="text-xl sm:text-2xl font-black text-ink tracking-editorial">
            {loading ? '—' : onSaleCount}
          </p>
          <Link
            href="/admin/products"
            className="mt-1 text-[10px] font-bold text-burgundy hover:text-burgundy-dark uppercase tracking-wider inline-flex items-center gap-0.5"
          >
            View <ArrowUpRight size={10} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-bone p-4 sm:p-5 hover:shadow-lux-1 transition-shadow">
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-ink-300 mb-2">Avg Price</p>
          <p className="text-xl sm:text-2xl font-black text-ink tracking-editorial tabular-nums">
            {loading ? '—' : formatPrice(avgPrice)}
          </p>
          <p className="text-[10px] text-ink-300 mt-1">across all pieces</p>
        </div>

        <div className="bg-white rounded-2xl border border-bone p-4 sm:p-5 hover:shadow-lux-1 transition-shadow">
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-ink-300 mb-2">Categories</p>
          <p className="text-xl sm:text-2xl font-black text-ink tracking-editorial">
            {loading ? '—' : categoriesCount}
            <span className="text-ink-300 text-base">/11</span>
          </p>
          <p className="text-[10px] text-ink-300 mt-1">in active use</p>
        </div>

        <Link
          href="/admin/products"
          className={`bg-white rounded-2xl border border-bone p-4 sm:p-5 hover:shadow-lux-1 transition-all text-left block ${
            lowStockCount > 0 ? 'border-amber-200 hover:border-amber-300' : ''
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={12} className="text-amber-500" />
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-ink-300">Low Stock</p>
          </div>
          <p className={`text-xl sm:text-2xl font-black tracking-editorial ${lowStockCount > 0 ? 'text-amber-600' : 'text-ink'}`}>
            {loading ? '—' : lowStockCount}
          </p>
          <p className="text-[10px] text-ink-300 mt-1">
            {lowStockCount > 0 ? 'need attention' : 'all good! ✓'}
          </p>
        </Link>
      </div>

      {/* ─── QUICK ACTIONS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <Link
          href="/admin/products"
          className="group flex items-center gap-4 bg-white border border-bone rounded-2xl px-5 py-4 hover:border-burgundy/30 hover:shadow-lux-1 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-soft flex items-center justify-center flex-shrink-0 group-hover:bg-burgundy/10 transition-colors">
            <Package size={18} className="text-burgundy" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-ink">Manage Products</p>
            <p className="text-[11px] text-ink-400">Edit, stock, pricing</p>
          </div>
          <ArrowUpRight size={14} className="text-ink-300 ml-auto group-hover:text-burgundy transition-colors flex-shrink-0" />
        </Link>

        <Link
          href="/admin/discounts"
          className="group flex items-center gap-4 bg-white border border-bone rounded-2xl px-5 py-4 hover:border-burgundy/30 hover:shadow-lux-1 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-soft flex items-center justify-center flex-shrink-0 group-hover:bg-burgundy/10 transition-colors">
            <Tag size={18} className="text-burgundy" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-ink">Discount Codes</p>
            <p className="text-[11px] text-ink-400">Promo codes &amp; offers</p>
          </div>
          <ArrowUpRight size={14} className="text-ink-300 ml-auto group-hover:text-burgundy transition-colors flex-shrink-0" />
        </Link>

        <Link
          href="/admin/products/new"
          className="group flex items-center gap-4 bg-gradient-to-r from-burgundy to-burgundy-dark border border-transparent rounded-2xl px-5 py-4 hover:shadow-lux-2 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <Plus size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-white">Add New Product</p>
            <p className="text-[11px] text-white/60">Upload to catalogue</p>
          </div>
          <ArrowUpRight size={14} className="text-white/50 ml-auto group-hover:text-white transition-colors flex-shrink-0" />
        </Link>
      </div>

      {/* ─── RECENT PRODUCTS ─── */}
      <div className="bg-white rounded-2xl border border-bone overflow-hidden shadow-lux-1">
        <div className="px-5 sm:px-6 py-4 border-b border-bone flex items-center justify-between">
          <h3 className="font-black text-ink text-base">Recent Products</h3>
          <Link
            href="/admin/products"
            className="text-[10px] font-black text-burgundy hover:text-burgundy-dark uppercase tracking-wider inline-flex items-center gap-1 transition-colors"
          >
            View All <ArrowUpRight size={10} />
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-bone rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-bone rounded w-2/5" />
                  <div className="h-2 bg-bone rounded w-1/5" />
                </div>
                <div className="h-3 bg-bone rounded w-16 hidden sm:block" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-black text-ink-400 text-sm mb-4">No products yet</p>
            <Button href="/admin/products/new" variant="dark" size="md" iconLeft={<Plus size={13} strokeWidth={2.5} />}>
              Add First Product
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-bone">
            {recent.map((p) => (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}`}
                className="flex items-center gap-4 px-5 sm:px-6 py-3.5 hover:bg-champagne-100/40 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-bone ring-1 ring-bone">
                  <Image
                    src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/40/40`}
                    alt={p.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>

                {/* Name + category */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink group-hover:text-burgundy transition-colors line-clamp-1">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-ink-400 capitalize">{p.category}</p>
                </div>

                {/* Price */}
                <span className="text-sm font-black text-ink tabular-nums hidden sm:block">
                  {formatPrice(p.price)}
                </span>

                {/* Stock badge */}
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full flex-shrink-0 ${
                  p.in_stock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                }`}>
                  {p.in_stock ? 'In Stock' : 'Out'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ─── COMING SOON SECTION ─── */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-4 bg-white/60 border border-bone rounded-2xl px-5 py-4 opacity-60">
          <div className="w-10 h-10 rounded-xl bg-bone flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={18} className="text-ink-400" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-black text-ink-400">Orders</p>
            <p className="text-[10px] text-ink-300">Coming soon</p>
          </div>
          <span className="ml-auto text-[9px] font-black uppercase tracking-wider bg-bone text-ink-400 px-2.5 py-1 rounded-full">Soon</span>
        </div>
        <div className="flex items-center gap-4 bg-white/60 border border-bone rounded-2xl px-5 py-4 opacity-60">
          <div className="w-10 h-10 rounded-xl bg-bone flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-ink-400" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-black text-ink-400">Customers</p>
            <p className="text-[10px] text-ink-300">Coming soon</p>
          </div>
          <span className="ml-auto text-[9px] font-black uppercase tracking-wider bg-bone text-ink-400 px-2.5 py-1 rounded-full">Soon</span>
        </div>
      </div>

    </AdminShell>
  );
}

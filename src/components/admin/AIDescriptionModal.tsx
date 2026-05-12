'use client';

import { useState } from 'react';
import { X, Loader2, Sparkles, Wand2, Check, RefreshCw, Copy } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface Props {
  productName: string;
  category?: string;
  onClose: () => void;
  onGenerated: (text: string) => void;
}

const STYLES = [
  { value: 'punchy', label: 'Punchy', sub: 'Short & confident', emoji: '⚡' },
  { value: 'poetic', label: 'Poetic', sub: 'Emotional & lyrical', emoji: '🌹' },
  { value: 'detailed', label: 'Detailed', sub: 'Feature-rich', emoji: '📝' },
];

export default function AIDescriptionModal({ productName, category, onClose, onGenerated }: Props) {
  const [extraDetails, setExtraDetails] = useState('');
  const [style, setStyle] = useState('punchy');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          whatMakesItSpecial: extraDetails,
          category,
          style,
          attempt,
        }),
      });

      if (!res.ok) throw new Error();
      const { description } = await res.json();
      setPreview(description);
      setAttempt((a) => a + 1);
    } catch {
      setError("Couldn't generate right now. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function useThis() {
    onGenerated(preview);
    toast.success('Description added!', 'You can edit it freely now.');
    onClose();
  }

  function copyToClipboard() {
    navigator.clipboard?.writeText(preview);
    toast.info('Copied to clipboard');
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[55] flex items-end sm:items-center justify-center px-0 sm:px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#C8102E] via-[#7B1818] to-[#7B1818] text-white px-6 py-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center">
              <Wand2 size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black">AI Copywriter</h3>
              <p className="text-[11px] text-white/70 mt-0.5">
                Writing for: <span className="text-white font-bold">{productName || 'your product'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Style picker */}
          <div>
            <label className="text-[10px] font-black tracking-wider uppercase text-gray-700 mb-2 block">
              Pick a style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STYLES.map((s) => {
                const active = style === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => { setStyle(s.value); setPreview(''); setAttempt(0); }}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                      active
                        ? 'border-[#C8102E] bg-rose-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{s.emoji}</span>
                    <span className={`text-[11px] font-black ${active ? 'text-[#C8102E]' : 'text-gray-700'}`}>{s.label}</span>
                    <span className="text-[9px] text-gray-400 leading-tight text-center">{s.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Single optional input */}
          <div>
            <label className="text-[10px] font-black tracking-wider uppercase text-gray-700 mb-1.5 block">
              Anything special to mention?{' '}
              <span className="text-gray-400 normal-case font-normal">(optional)</span>
            </label>
            <input
              value={extraDetails}
              onChange={(e) => setExtraDetails(e.target.value)}
              placeholder="e.g. hand-finished, Italian leather, comes in 3 colours"
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#C8102E] focus:ring-4 focus:ring-[#C8102E]/10 transition-all"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              The AI already knows the product name and category — just add anything extra.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="bg-gradient-to-br from-rose-50 to-amber-50/40 border border-[#C8102E]/20 rounded-2xl p-5 animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black tracking-wider uppercase text-[#C8102E] flex items-center gap-1.5">
                  <Sparkles size={11} className="text-amber-500" /> Preview
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={copyToClipboard}
                    className="p-1.5 text-gray-500 hover:text-[#C8102E] hover:bg-white rounded-lg transition-all"
                    title="Copy"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    onClick={generate}
                    disabled={loading}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-gray-500 hover:text-[#C8102E] hover:bg-white rounded-lg transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    Try again
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed font-medium italic">&ldquo;{preview}&rdquo;</p>
              <p className="text-[10px] text-gray-400 mt-3">{preview.split(' ').length} words · Edit freely after applying.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex gap-3">
          {!preview ? (
            <button
              onClick={generate}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 via-[#C8102E] to-gray-900 bg-[length:200%_100%] hover:bg-[100%_0] text-white font-black text-sm py-3.5 rounded-xl active:scale-95 transition-all duration-500 disabled:opacity-40 shadow-lg shadow-[#C8102E]/25"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Writing…</>
              ) : (
                <><Wand2 size={14} strokeWidth={2.5} /> Generate Description</>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={() => { setPreview(''); setAttempt(0); }}
                className="px-4 py-3 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors"
              >
                Start over
              </button>
              <button
                onClick={useThis}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-sm py-3.5 rounded-xl active:scale-95 transition-all shadow-lg shadow-green-500/30"
              >
                <Check size={15} strokeWidth={2.5} /> Use This
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

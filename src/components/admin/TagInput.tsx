'use client';

import { useState, KeyboardEvent, ChangeEvent, ClipboardEvent } from 'react';
import { X } from 'lucide-react';

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
}

// Split on commas OR semicolons OR newlines, drop empties + duplicates,
// preserve insertion order. The admin frequently types "Red, Blue, Black"
// in one line — without this they'd save a single 'Red, Blue, Black' tag.
function splitInput(raw: string): string[] {
  return raw
    .split(/[,;\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function mergeUnique(existing: string[], incoming: string[]): string[] {
  const seen = new Set(existing.map((t) => t.toLowerCase()));
  const out = [...existing];
  for (const t of incoming) {
    if (!seen.has(t.toLowerCase())) {
      seen.add(t.toLowerCase());
      out.push(t);
    }
  }
  return out;
}

export default function TagInput({ value, onChange }: Props) {
  const [input, setInput] = useState('');

  function commit(text: string) {
    const tags = splitInput(text);
    if (tags.length === 0) return;
    onChange(mergeUnique(value, tags));
    setInput('');
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    // If the user just typed a comma (or pasted text containing one), split
    // and commit everything before the trailing fragment — that becomes the
    // new input so they can keep typing the next tag without losing flow.
    if (/[,;\n]/.test(next)) {
      const parts = next.split(/[,;\n]/);
      const tail = parts.pop() ?? '';
      const completed = parts.map((p) => p.trim()).filter(Boolean);
      if (completed.length > 0) {
        onChange(mergeUnique(value, completed));
      }
      setInput(tail);
      return;
    }
    setInput(next);
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text');
    if (/[,;\n]/.test(text)) {
      e.preventDefault();
      commit(input + text);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-primary/10 text-primary font-body text-sm px-3 py-1 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-primary/60 hover:text-primary transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKey}
        onPaste={handlePaste}
        onBlur={() => commit(input)}
        placeholder="Type and press Enter — or separate with commas"
        className="w-full border border-blush rounded-2xl px-4 py-3 font-body text-dark bg-cream focus:outline-none focus:border-primary transition-colors text-base"
      />
      <p className="font-body text-xs text-muted mt-1">
        Press Enter or type a comma to add each one. Paste a comma-separated list to add them all at once.
      </p>
    </div>
  );
}

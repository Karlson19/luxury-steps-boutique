'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ value, onChange }: Props) {
  const [input, setInput] = useState('');

  function addTag() {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput('');
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
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
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={addTag}
        placeholder="Type a detail and press Enter..."
        className="w-full border border-blush rounded-2xl px-4 py-3 font-body text-dark bg-cream focus:outline-none focus:border-primary transition-colors text-base"
      />
      <p className="font-body text-xs text-muted mt-1">Press Enter after each detail to add it.</p>
    </div>
  );
}

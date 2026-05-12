'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
}

// ─── CLIENT-SIDE COMPRESSION ───
// Resize to max 1200px and re-encode as JPEG @ 82% quality before uploading.
// This brings a typical 4-8MB camera photo down to ~150-400KB so WhatsApp's
// link-preview bot never times out when scraping the product page.
async function compressImage(file: File, maxDimension = 1200, quality = 0.82): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Only shrink — never enlarge small images
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height / width) * maxDimension);
          width = maxDimension;
        } else {
          width = Math.round((width / height) * maxDimension);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; } // fallback to original on failure
          // Always store as .jpg for consistency
          const newName = file.name.replace(/\.[^.]+$/, '.jpg');
          resolve(new File([blob], newName, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // fallback — upload original if something goes wrong
    };

    img.src = objectUrl;
  });
}

export default function ImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = 5 - value.length;
    if (remaining <= 0) {
      setError('Maximum 5 photos allowed.');
      return;
    }

    setError('');
    const newUrls: string[] = [];
    const toProcess = Math.min(files.length, remaining);

    for (let i = 0; i < toProcess; i++) {
      const raw = files[i];

      // Reject files that are unreasonably large even before compression
      if (raw.size > 50 * 1024 * 1024) {
        setError('Each photo must be under 50MB.');
        continue;
      }

      // ─── COMPRESS ───
      setCompressing(true);
      const file = await compressImage(raw);
      setCompressing(false);

      // Always upload as JPEG after compression
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

      setUploading(true);
      try {
        // Get signed upload URL (always JPEG after compression)
        const res = await fetch(
          `/api/admin/upload-url?filename=${encodeURIComponent(filename)}&type=image%2Fjpeg`
        );
        if (!res.ok) throw new Error('Could not get upload URL');
        const { url, publicUrl } = await res.json();

        // Upload directly to Supabase
        const uploadRes = await fetch(url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': 'image/jpeg' },
        });
        if (!uploadRes.ok) throw new Error('Upload failed');

        newUrls.push(publicUrl);
        setProgress(Math.round(((i + 1) / toProcess) * 100));
      } catch {
        setError("Oops! The photo didn't upload. Please try again.");
      }
    }

    onChange([...value, ...newUrls]);
    setUploading(false);
    setProgress(0);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  const busy = compressing || uploading;

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => !busy && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          busy
            ? 'border-primary/30 bg-blush/20 cursor-wait'
            : 'border-blush cursor-pointer hover:border-primary/40 hover:bg-blush/30'
        }`}
      >
        {compressing ? (
          <div className="flex flex-col items-center gap-3">
            <ImageIcon size={32} className="text-primary animate-pulse" />
            <p className="font-body text-sm text-muted">Compressing image…</p>
            <p className="font-body text-xs text-muted/60">Shrinking for faster previews</p>
          </div>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-primary animate-spin" />
            <p className="font-body text-sm text-muted">Uploading… {progress}%</p>
            <div className="w-48 h-2 bg-blush rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <Upload size={32} className="text-muted mx-auto mb-3" />
            <p className="font-body text-sm font-medium text-dark mb-1">Tap to add photos, or drag them here</p>
            <p className="font-body text-xs text-muted">Add clear photos of your product. Up to 5 photos.</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="font-body text-sm text-red-500 mt-2">{error}</p>}

      {/* Previews */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {value.map((url, i) => (
            <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden group">
              <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 bg-dark/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// One-shot: render public/icon.svg to PWA PNGs.
// Run: node scripts/build-icons.mjs
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root  = process.cwd();
const svg   = await readFile(path.join(root, 'public', 'icon.svg'));

const sizes = [
  { out: 'icon-192.png', size: 192 },
  { out: 'icon-512.png', size: 512 },
  // Apple touch icon — 180×180 is the iOS sweet spot
  { out: 'apple-icon.png', size: 180 },
  // Browser favicons
  { out: 'icon-32.png',  size: 32  },
  { out: 'icon-16.png',  size: 16  },
];

for (const { out, size } of sizes) {
  const buf = await sharp(svg, { density: 600 })
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(path.join(root, 'public', out), buf);
  console.log(`✓ ${out} (${size}×${size}, ${(buf.length / 1024).toFixed(1)} KB)`);
}

// Landscape OG card (1200×630) — social shares of the homepage / categories.
const ogSvg = await readFile(path.join(root, 'public', 'og.svg'));
const ogBuf = await sharp(ogSvg, { density: 300 })
  .resize(1200, 630, { fit: 'cover' })
  .jpeg({ quality: 90, mozjpeg: true })
  .toBuffer();
await writeFile(path.join(root, 'public', 'og-image.jpg'), ogBuf);
console.log(`✓ og-image.jpg (1200×630, ${(ogBuf.length / 1024).toFixed(1)} KB)`);

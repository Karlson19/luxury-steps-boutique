import ProductClient from './ProductClient';

// Metadata for this segment is defined in ./layout.tsx (one source of truth).
// Keeping page.tsx minimal also reduces server work on every request.
export default function ProductServerPage() {
  return <ProductClient />;
}

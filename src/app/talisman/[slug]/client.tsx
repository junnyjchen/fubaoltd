'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/data/types';

interface Props {
  product: Product;
}

export function ProductDetailClient({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [personalizedInfo, setPersonalizedInfo] = useState('');
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(
      product.slug,
      quantity,
      product.isPersonalized ? personalizedInfo : undefined
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mt-6">
      {/* Personalized Info */}
      {product.isPersonalized && (
        <div className="mb-4">
          <label
            htmlFor="personalized"
            className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink"
          >
            Birth Information (optional)
          </label>
          <textarea
            id="personalized"
            value={personalizedInfo}
            onChange={(e) => setPersonalizedInfo(e.target.value)}
            placeholder="Enter your birth year, season, and any specific focus..."
            className="w-full border border-border bg-transparent px-3 py-2 text-sm text-ink placeholder:text-smoke/50 focus:border-cinnabar focus:outline-none"
            rows={3}
          />
        </div>
      )}

      {/* Quantity */}
      <div className="mb-4 flex items-center gap-4">
        <span className="text-xs font-medium uppercase tracking-wide text-ink">
          Quantity
        </span>
        <div className="flex items-center border border-border">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 text-sm text-smoke transition-colors hover:text-ink"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="border-x border-border px-4 py-2 text-sm text-ink">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-2 text-sm text-smoke transition-colors hover:text-ink"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart */}
      <button
        onClick={handleAdd}
        className={`w-full border py-3 text-sm font-medium tracking-wide transition-all duration-300 ${
          added
            ? 'border-green-600 bg-green-600 text-white'
            : 'border-cinnabar bg-cinnabar text-white hover:bg-cinnabar/90'
        }`}
      >
        {added ? 'Added to Cart' : 'Add to Cart'}
      </button>
    </div>
  );
}

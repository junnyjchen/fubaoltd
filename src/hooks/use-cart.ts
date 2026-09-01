'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CartItem } from '@/lib/data/types';

const CART_STORAGE_KEY = 'fubao-cart';

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as CartItem[];
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveCart(items);
    }
  }, [items, isLoaded]);

  const addItem = useCallback(
    (slug: string, quantity: number = 1, personalizedInfo?: string) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.slug === slug);
        if (existing) {
          return prev.map((item) =>
            item.slug === slug
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [
          ...prev,
          { slug, quantity, personalizedInfo },
        ];
      });
    },
    []
  );

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.slug !== slug));
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.slug === slug ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((item) => item.slug !== slug));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    isLoaded,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
  };
}

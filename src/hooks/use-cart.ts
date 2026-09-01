'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CartItem } from '@/lib/data/types';
import {
  spreeCreateCart,
  spreeGetCart,
  spreeGetVariantId,
  spreeAddItem,
  spreeSetQuantity,
  spreeRemoveLineItem,
  spreeEmptyCart,
  getSpreeCartToken,
  saveSpreeCartToken,
  clearSpreeCartToken,
  type SpreeCart,
} from '@/lib/spree/client';

const LEGACY_CART_KEY = 'fubao-cart';

/**
 * Spree Commerce guest cart flow:
 * 1. On mount, reconnect to an existing cart via stored guest token (GET /cart).
 * 2. Mutations call the Spree v2 storefront API and return fresh cart state
 *    so the UI stays in sync with the server.
 * 3. Guest token persisted in localStorage — same lifetime as a real Spree
 *    guest order token. After checkout completes, resetCart() drops it so the
 *    next visit starts a fresh cart.
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cartNumber, setCartNumber] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const lineItemIdsRef = useRef<Map<string, string>>(new Map());

  const applyCartState = useCallback((cart: SpreeCart | null) => {
    if (!cart) {
      setItems([]);
      setCartNumber(null);
      lineItemIdsRef.current.clear();
      return;
    }
    setCartNumber(cart.number);
    const idMap = new Map<string, string>();
    setItems(
      cart.lineItems.map((li) => {
        idMap.set(li.slug, li.id);
        return {
          slug: li.slug,
          name: li.name,
          price: li.price,
          quantity: li.quantity,
          imageKey: li.imageKey,
          personalization: li.personalization ?? undefined,
        };
      })
    );
    lineItemIdsRef.current = idMap;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = getSpreeCartToken();
      let legacyItems: CartItem[] = [];
      try {
        const legacy = localStorage.getItem(LEGACY_CART_KEY);
        if (legacy) legacyItems = JSON.parse(legacy) as CartItem[];
      } catch {
        legacyItems = [];
      }

      let connected = false;
      if (stored) {
        tokenRef.current = stored;
        try {
          const cart = await spreeGetCart(stored);
          if (cart && !cancelled) {
            if (cart.state === 'complete') {
              // The guest cart became an order after checkout — start fresh.
              clearSpreeCartToken();
              tokenRef.current = null;
            } else {
              applyCartState(cart);
              connected = true;
            }
          }
        } catch {
          tokenRef.current = null;
        }
      }

      // One-time migration of the legacy localStorage cart into a Spree cart.
      if (legacyItems.length > 0 && !cancelled && !connected) {
        try {
          let token = tokenRef.current;
          if (!token) {
            const cart = await spreeCreateCart();
            token = cart.token;
            tokenRef.current = token;
          }
          for (const it of legacyItems) {
            const variantId = await spreeGetVariantId(it.slug);
            if (variantId)
              await spreeAddItem(
                token,
                variantId,
                it.quantity,
                it.personalization ? { personalization: it.personalization } : undefined
              );
          }
          const fresh = await spreeGetCart(token);
          if (!cancelled) applyCartState(fresh);
          localStorage.removeItem(LEGACY_CART_KEY);
        } catch {
          // best-effort migration
        }
      }
      if (!cancelled) setIsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureToken = useCallback(async (): Promise<string | null> => {
    if (tokenRef.current) return tokenRef.current;
    try {
      const cart = await spreeCreateCart();
      tokenRef.current = cart.token;
      saveSpreeCartToken(cart.token);
      applyCartState(cart);
      return cart.token;
    } catch {
      return null;
    }
  }, [applyCartState]);

  const addItem = useCallback(
    async (slug: string, quantity: number = 1, personalization?: string) => {
      const token = await ensureToken();
      if (!token) return;
      const variantId = await spreeGetVariantId(slug);
      if (!variantId) return;
      setIsSyncing(true);
      try {
        const cart = await spreeAddItem(
          token,
          variantId,
          quantity,
          personalization ? { personalization } : undefined
        );
        applyCartState(cart);
      } finally {
        setIsSyncing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ensureToken, applyCartState]
  );

  const updateQuantity = useCallback(
    async (slug: string, quantity: number) => {
      const token = tokenRef.current;
      if (!token) return;
      if (quantity <= 0) {
        await removeItem(slug);
        return;
      }
      const lineItemId = lineItemIdsRef.current.get(slug);
      if (!lineItemId) return;
      setIsSyncing(true);
      try {
        const cart = await spreeSetQuantity(token, lineItemId, quantity);
        applyCartState(cart);
      } finally {
        setIsSyncing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applyCartState]
  );

  const removeItem = useCallback(
    async (slug: string) => {
      const token = tokenRef.current;
      if (!token) return;
      const lineItemId = lineItemIdsRef.current.get(slug);
      if (!lineItemId) return;
      setIsSyncing(true);
      try {
        const cart = await spreeRemoveLineItem(token, lineItemId);
        applyCartState(cart);
      } finally {
        setIsSyncing(false);
      }
    },
    [applyCartState]
  );

  const clearCart = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) return;
    setIsSyncing(true);
    try {
      const cart = await spreeEmptyCart(token);
      applyCartState(cart);
    } finally {
      setIsSyncing(false);
    }
  }, [applyCartState]);

  /**
   * Drop the current cart session entirely (guest token included). Called by
   * checkout after the order is completed — the Spree cart has become an
   * order, so the next add-to-cart must start a brand-new cart.
   */
  const resetCart = useCallback(() => {
    tokenRef.current = null;
    clearSpreeCartToken();
    setItems([]);
    setCartNumber(null);
    lineItemIdsRef.current.clear();
  }, []);

  const refresh = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) return;
    try {
      const cart = await spreeGetCart(token);
      if (cart) applyCartState(cart);
    } catch {
      // ignore transient errors
    }
  }, [applyCartState]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    isLoaded,
    isSyncing,
    cartNumber,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    resetCart,
    refresh,
    totalItems,
  };
}

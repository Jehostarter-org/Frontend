"use client";

import { CartItem } from '@/components/types/types';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from '@/components/contexts/auth-context';
import {
  useGetSavedListingsQuery,
  useBookmarkListingMutation,
  useUnbookmarkListingMutation,
} from '@/lib/api/savedListingsApiSlice';
import { productToCartItem } from '@/lib/cart-utils';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalDistinctItems: () => number;
  getTotalPrice: () => number;
  isInCart: (id: string) => boolean;
  toggleBookmark: (product: any) => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const QUANTITY_KEY = 'jeho_cart_quantities';

function loadQuantities(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(QUANTITY_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveQuantities(quantities: Record<string, number>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(QUANTITY_KEY, JSON.stringify(quantities));
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data: savedListings, isLoading, refetch } = useGetSavedListingsQuery(
    undefined,
    { skip: !isLoggedIn },
  );

  const [bookmarkListing] = useBookmarkListingMutation();
  const [unbookmarkListing] = useUnbookmarkListingMutation();

  useEffect(() => {
    if (!isLoggedIn) {
      setCartItems([]);
      return;
    }
    if (!savedListings) return;

    const stored = loadQuantities();
    setQuantities(stored);
    setCartItems(
      savedListings.map(({ listing }) => {
        const base = productToCartItem(listing);
        return { ...base, quantity: stored[base.id] ?? 1 };
      }),
    );
  }, [isLoggedIn, savedListings]);

  const persistQuantity = useCallback((id: string, quantity: number) => {
    setQuantities((prev) => {
      const next = { ...prev, [id]: quantity };
      saveQuantities(next);
      return next;
    });
  }, []);

  const addToCart = useCallback(
    async (item: Omit<CartItem, 'quantity'>) => {
      setCartItems((prev) => {
        const existing = prev.find((cartItem) => cartItem.id === item.id);
        if (existing) {
          const quantity = Math.min(existing.quantity + 1, existing.stock);
          persistQuantity(item.id, quantity);
          return prev.map((cartItem) =>
            cartItem.id === item.id ? { ...cartItem, quantity } : cartItem,
          );
        }
        persistQuantity(item.id, 1);
        return [...prev, { ...item, quantity: 1 }];
      });

      if (isLoggedIn) {
        try {
          await bookmarkListing(item.id).unwrap();
        } catch {
          refetch();
        }
      }
    },
    [isLoggedIn, bookmarkListing, refetch, persistQuantity],
  );

  const removeFromCart = useCallback(
    async (id: string) => {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      setQuantities((prev) => {
        const next = { ...prev };
        delete next[id];
        saveQuantities(next);
        return next;
      });

      if (isLoggedIn) {
        try {
          await unbookmarkListing(id).unwrap();
        } catch {
          refetch();
        }
      }
    },
    [isLoggedIn, unbookmarkListing, refetch],
  );

  const toggleBookmark = useCallback(
    async (product: any) => {
      const id = product?.id;
      if (!id) return;

      if (cartItems.some((item) => item.id === id)) {
        await removeFromCart(id);
        return;
      }

      const item = productToCartItem(product);
      const quantity = quantities[id] ?? 1;
      setCartItems((prev) => [...prev, { ...item, quantity }]);
      persistQuantity(id, quantity);

      if (isLoggedIn) {
        try {
          await bookmarkListing(id).unwrap();
        } catch {
          refetch();
        }
      }
    },
    [cartItems, removeFromCart, isLoggedIn, bookmarkListing, refetch, quantities, persistQuantity],
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity < 1) return;

      setCartItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const nextQty = Math.min(quantity, item.stock);
          persistQuantity(id, nextQty);
          return { ...item, quantity: nextQty };
        }),
      );
    },
    [persistQuantity],
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    setQuantities({});
    saveQuantities({});
  }, []);

  const getTotalItems = useCallback(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const getTotalDistinctItems = useCallback(() => cartItems.length, [cartItems]);

  const getTotalPrice = useCallback(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );

  const isInCart = useCallback(
    (id: string) => cartItems.some((item) => item.id === id),
    [cartItems],
  );

  const value = React.useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalDistinctItems,
      getTotalPrice,
      isInCart,
      toggleBookmark,
      isLoading,
    }),
    [
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalDistinctItems,
      getTotalPrice,
      isInCart,
      toggleBookmark,
      isLoading,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

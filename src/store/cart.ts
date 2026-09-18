"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  productId: number;
  slug: string;
  nameEn: string;
  nameFi: string;
  price: number;
  image: string;
  unit: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, qty: Math.min(i.qty + qty, 99) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, qty }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      setQty: (productId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, qty: Math.min(qty, 99) } : i
                ),
        })),
      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "baraka-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export function cartCount(items: CartItem[]): number {
  return items.reduce((n, i) => n + i.qty, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return Math.round(items.reduce((sum, i) => sum + i.price * i.qty, 0) * 100) / 100;
}

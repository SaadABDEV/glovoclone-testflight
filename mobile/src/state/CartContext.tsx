import React, { createContext, useContext, useMemo, useState } from "react";
import { MenuItem } from "../types";

type CartItem = {
  item: MenuItem;
  quantity: number;
};

type CartContextValue = {
  restaurantId: string | null;
  items: CartItem[];
  totalCents: number;
  addItem: (restaurantId: string, item: MenuItem) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (nextRestaurantId: string, item: MenuItem) => {
    setRestaurantId((current) => {
      if (current && current !== nextRestaurantId) {
        setItems([{ item, quantity: 1 }]);
        return nextRestaurantId;
      }
      return nextRestaurantId;
    });

    setItems((current) => {
      const existing = current.find((entry) => entry.item.id === item.id);
      if (!existing) return [...current, { item, quantity: 1 }];
      return current.map((entry) =>
        entry.item.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
      );
    });
  };

  const clear = () => {
    setRestaurantId(null);
    setItems([]);
  };

  const totalCents = items.reduce((sum, entry) => sum + entry.item.price_cents * entry.quantity, 0);

  const value = useMemo(
    () => ({ restaurantId, items, totalCents, addItem, clear }),
    [restaurantId, items, totalCents]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit etre utilise dans CartProvider");
  return ctx;
};

import { useEffect, useState } from "react";
import { readCart, cartTotals } from "@/lib/cart";

export function useCart() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    window.addEventListener("sweet-shop-cart-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("sweet-shop-cart-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const totals = cartTotals(items);
  const count = items.reduce((n, i) => n + i.quantity, 0);
  return { items, count, ...totals };
}
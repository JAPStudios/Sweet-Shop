const KEY = "sweet-shop-cart";
const EVENT = "sweet-shop-cart-change";

export function readCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function addToCart(product, quantity = 1) {
  const items = readCart();
  const existing = items.find((item) => item.product_id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      product_id: product.id,
      title: product.title,
      price_cents: product.price_cents,
      image_url: product.image_url,
      seller_id: product.seller_id,
      seller_name: product.seller_name,
      quantity,
    });
  }
  writeCart(items);
  return items;
}

export function setQuantity(productId, quantity) {
  const items = readCart()
    .map((item) => (item.product_id === productId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
  writeCart(items);
  return items;
}

export function removeFromCart(productId) {
  const items = readCart().filter((item) => item.product_id !== productId);
  writeCart(items);
  return items;
}

export function clearCart() {
  writeCart([]);
}

export function cartTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price_cents * item.quantity, 0);
  const sellers = new Set(items.map((item) => item.seller_id)).size;
  return { subtotal, sellers, delivery: null, total: null };
}

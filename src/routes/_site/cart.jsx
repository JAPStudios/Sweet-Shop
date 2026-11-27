import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { setQuantity, removeFromCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_site/cart")({
  head: () => ({ meta: [{ title: "Your basket — Sweet Shop" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, sellers } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <p className="eyebrow">Your basket</p>
        <h1 className="mt-3 text-3xl">Nothing in the basket yet</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Browse the pantry and add goods. Delivery is quoted at checkout.
        </p>
        <Button asChild className="mt-7 rounded-full">
          <Link to="/browse">Browse the pantry</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="eyebrow">Your basket</p>
      <h1 className="mt-3 text-3xl">Ready when you are</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.product_id} className="sweet-card flex gap-4 p-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.title} className="h-full w-full" fittingType="fill" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-heading text-lg leading-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.seller_name}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatMoney(item.price_cents * item.quantity)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-full border border-border/80 bg-white/80 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.product_id, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
                      aria-label={`Reduce ${item.title}`}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.product_id, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
                      aria-label={`Add another ${item.title}`}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product_id)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="sweet-card h-fit p-6">
          <h2 className="font-heading text-xl">Summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Goods at listed price</dt>
              <dd>{formatMoney(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>Quoted at checkout</dd>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-3 text-base font-semibold">
              <dt>Goods subtotal</dt>
              <dd>{formatMoney(subtotal)}</dd>
            </div>
          </dl>
          <p className="mt-4 rounded-2xl bg-secondary/60 p-3 text-xs leading-relaxed text-secondary-foreground">
            Delivery is calculated from distinct seller pickup locations. Sellers sharing one pickup address are consolidated into one pickup charge.
          </p>
          <Button asChild size="lg" className="mt-6 w-full rounded-full">
            <Link to="/checkout">Continue to checkout</Link>
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {sellers > 1
              ? `${sellers} sellers — UnterSous handles pickup and delivery. Its connection to this preview is not active.`
              : "One seller — UnterSous handles pickup and delivery. Its connection to this preview is not active."}
          </p>
        </aside>
      </div>
    </div>
  );
}

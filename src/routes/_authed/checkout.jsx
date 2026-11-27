import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Info, LoaderCircle } from "lucide-react";
import { getDeliveryQuote } from "@/lib/order-fns";
import { useCart } from "@/hooks/useCart";
import { formatMoney } from "@/lib/format";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Sweet Shop" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, sellers } = useCart();
  const quoteDelivery = useServerFn(getDeliveryQuote);
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const quoteItems = items.map((item) => ({ product_id: item.product_id, quantity: item.quantity }));
  const productKey = quoteItems
    .map((item) => `${item.product_id}:${item.quantity}`)
    .sort()
    .join("|");

  useEffect(() => {
    if (!productKey) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setQuoteLoading(true);
    setQuote(null);
    setQuoteError("");
    const requestItems = productKey.split("|").map((entry) => {
      const [product_id, quantity] = entry.split(":");
      return { product_id, quantity: Number(quantity) };
    });
    quoteDelivery({ data: { items: requestItems } })
      .then((result) => {
        if (!cancelled) setQuote(result);
      })
      .catch((err) => {
        if (!cancelled) setQuoteError(err?.message || "Delivery could not be quoted.");
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productKey]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-3xl">Your basket is empty</h1>
        <p className="mt-3 text-sm text-muted-foreground">Add goods before checking out.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/browse">Browse the pantry</Link>
        </Button>
      </div>
    );
  }

  const quoteAvailable = !!quote?.available;
  const total = quoteAvailable ? subtotal + quote.delivery_fee_cents : null;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-3 text-3xl">Order summary</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="sweet-card p-6 sm:p-8">
          <h2 className="font-heading text-xl">Delivery quote</h2>
          {quoteLoading ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Calculating delivery…
            </p>
          ) : quoteAvailable ? (
            <div className="mt-4 rounded-2xl bg-secondary/60 p-4">
              <p className="text-sm font-semibold">{formatMoney(quote.delivery_fee_cents)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {quote.pickup_count} distinct pickup {quote.pickup_count === 1 ? "location" : "locations"} across{" "}
                {quote.seller_count} sellers. Sellers sharing the same pickup address count as one location.
              </p>
            </div>
          ) : (
            <p className="mt-4 rounded-2xl bg-muted/70 p-4 text-sm text-muted-foreground">
              {quoteError || quote?.message || "A delivery quote is not available for this basket."}
            </p>
          )}

          <div className="mt-8 border-t border-border/60 pt-6">
            <h2 className="font-heading text-xl">Payment is not configured</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Wix Payments is the selected provider. Base44 currently reports that its Wix Payments connection is unavailable for this account or country. This status does not establish that Wix Payments is unsupported in the United States. Until a payment can be confirmed, checkout stays closed.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              No order is created, no stock is reserved and no parcel is passed to a seller from this screen. Nothing
              has been charged.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              No income-adjusted price is applied either: a Butter Bank assessment sets that, and the connection is not
              configured, so goods are priced at each seller's listed price.
            </p>
          </div>

          {user?.role === "admin" && (
            <Button asChild variant="outline" className="mt-6 rounded-full">
              <Link to="/delivery-settings">Configure delivery rates</Link>
            </Button>
          )}
        </section>

        <aside className="sweet-card h-fit p-6">
          <h2 className="font-heading text-xl">Your basket</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.product_id} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {item.quantity} × {item.title}
                </span>
                <span>{formatMoney(item.price_cents * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2 border-t border-border/60 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Goods at listed price</dt>
              <dd>{formatMoney(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Delivery · {sellers} {sellers === 1 ? "seller" : "sellers"}
              </dt>
              <dd>{quoteAvailable ? formatMoney(quote.delivery_fee_cents) : "Not available"}</dd>
            </div>
            {quoteAvailable && (
              <div className="flex justify-between border-t border-border/60 pt-3 text-base font-semibold">
                <dt>Order total</dt>
                <dd>{formatMoney(total)}</dd>
              </div>
            )}
          </dl>

          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Delivery rates must be configured by an administrator. The rate schedule has no default amounts.
          </p>
          <Button type="button" size="lg" className="mt-6 w-full rounded-full" disabled>
            Checkout unavailable
          </Button>
        </aside>
      </div>
    </div>
  );
}
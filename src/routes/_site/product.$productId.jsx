import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, Clock, HandHeart, Minus, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getProduct } from "@/lib/server-fns";
import { addToCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { categoryLabel, MAKER_TYPES, VERIFICATION } from "@/lib/catalog";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import StatusPill from "@/components/site/StatusPill";

export const Route = createFileRoute("/_site/product/$productId")({
  loader: async ({ params }) => {
    const result = await getProduct({ data: { id: params.productId } });
    if (!result.product) throw notFound();
    return result;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.product?.title ?? "Listing"} — Sweet Shop` }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [quantity, setQuantity] = useState(1);
  const images = (product.images?.length ? product.images : [product.image_url]).filter(Boolean);
  const isVerified = product.verification_status === "verified";

  const add = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} × ${product.title} added to your basket`);
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link to="/browse" className="text-xs font-medium text-primary/80 hover:text-primary">
        ← Back to the shelf
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="sweet-card overflow-hidden p-2.5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-muted">
              {images[0] ? (
                <Image src={images[0]} alt={product.title} className="h-full w-full" fittingType="fill" />
              ) : (
                <div className="flex h-full items-center justify-center font-heading text-5xl text-primary/20">
                  ✽
                </div>
              )}
            </div>
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.slice(1).map((src) => (
                <div key={src} className="h-20 w-20 overflow-hidden rounded-xl bg-muted">
                  <Image src={src} alt={product.title} className="h-full w-full" fittingType="fill" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-foreground/70">
              {categoryLabel(product.category)}
            </span>
            <StatusPill status={product.verification_status} map={VERIFICATION} />
            {product.is_on_demand && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                <Clock className="h-3 w-3" /> Made to order
              </span>
            )}
          </div>

          <h1 className="mt-4 text-3xl leading-tight sm:text-4xl">{product.title}</h1>
          <p className="mt-2 text-sm font-medium text-primary/80">{product.seller_name}</p>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="font-heading text-3xl">{formatMoney(product.price_cents)}</span>
            {product.compare_at_price_cents > 0 && (
              <span className="text-base text-muted-foreground line-through">
                {formatMoney(product.compare_at_price_cents)}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            This is the seller's listed price. Delivery is shown at checkout.
          </p>

          <p className="mt-6 text-sm leading-relaxed text-foreground/80">{product.description}</p>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-border/80 bg-white/80 p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) =>
                    product.is_on_demand ? q + 1 : Math.min(Math.max(1, product.stock ?? 1), q + 1),
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button onClick={add} size="lg" className="rounded-full" disabled={!isVerified}>
              Add to basket
            </Button>
          </div>
          {!isVerified && (
            <p className="mt-3 text-xs text-destructive">
              This listing is still private — it cannot be bought until it is verified.
            </p>
          )}

          <dl className="mt-8 space-y-4 border-t border-border/60 pt-6 text-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
              <div>
                <dt className="font-medium">Verification</dt>
                <dd className="text-muted-foreground">
                  {isVerified ? "Product testing and legitimacy checks were completed before publication." : "Verification is not complete."}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
              <div>
                <dt className="font-medium">Where it comes from</dt>
                <dd className="text-muted-foreground">
                  {product.provenance || "Not supplied."}
                </dd>
              </div>
            </div>
            {product.maker_compensation_cents > 0 && (
              <div className="flex items-start gap-3">
                <HandHeart className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                <div>
                  <dt className="font-medium">
                    Maker compensation rate: {formatMoney(product.maker_compensation_cents)} per item
                  </dt>
                  <dd className="text-muted-foreground">
                    {MAKER_TYPES[product.maker_type] ?? "Independent seller"}
                    {product.maker_name ? ` · ${product.maker_name}` : ""}
                  </dd>
                </div>
              </div>
            )}
            {product.is_on_demand && (
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                <div>
                  <dt className="font-medium">Made to order</dt>
                  <dd className="text-muted-foreground">
                    The maker's stated lead time is {product.lead_time_days} days before it is packed.
                  </dd>
                </div>
              </div>
            )}
            {!product.is_on_demand && (
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                <div>
                  <dt className="font-medium">
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </dt>
                  <dd className="text-muted-foreground">Packed by {product.seller_name}.</dd>
                </div>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
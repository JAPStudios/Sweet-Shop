import { Link } from "@tanstack/react-router";
import { formatMoney } from "@/lib/format";
import { VERIFICATION } from "@/lib/catalog";
import StatusPill from "@/components/site/StatusPill";
import { Button } from "@/components/ui/button";

export default function SellerListings({ products, onSubmit, busyId }) {
  if (products.length === 0) {
    return (
      <div className="sweet-card p-8 text-center">
        <p className="font-heading text-xl">No listings yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your first good. It stays private until a pantry reviewer approves it.
        </p>
        <Button asChild className="mt-5 rounded-full">
          <Link to="/seller/new">Add a listing</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {products.map((product) => (
        <li key={product.id} className="sweet-card flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-heading text-lg">{product.title}</p>
              <StatusPill status={product.verification_status} map={VERIFICATION} />
              {product.is_on_demand && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-accent-foreground">
                  On demand
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatMoney(product.price_cents)} ·{" "}
              {product.is_on_demand ? `${product.lead_time_days} day lead time` : `${product.stock} in stock`}
              {product.source === "imported" ? " · imported" : ""}
            </p>
            {product.verification_notes && product.verification_status === "rejected" && (
              <p className="mt-1 text-xs text-destructive">{product.verification_notes}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {product.verification_status === "verified" && (
              <Button asChild variant="ghost" size="sm" className="rounded-full text-primary">
                <Link to="/product/$productId" params={{ productId: product.id }}>
                  View public page
                </Link>
              </Button>
            )}
            {(product.verification_status === "draft" || product.verification_status === "rejected") && (
              <>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link to="/seller/new" search={{ productId: product.id }}>Edit</Link>
                </Button>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => onSubmit(product)}
                  disabled={!!busyId}
                >
                  {busyId === product.id ? "Submitting…" : "Submit for verification"}
                </Button>
              </>
            )}
            {product.verification_status === "pending" && (
              <span className="text-xs text-muted-foreground">Waiting for a reviewer</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

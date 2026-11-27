import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PackageOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatDate, formatMoney } from "@/lib/format";
import { ORDER_STATUS } from "@/lib/catalog";
import StatusPill from "@/components/site/StatusPill";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/orders/")({
  head: () => ({ meta: [{ title: "Your orders — Sweet Shop" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = () => {
    setLoading(true);
    setError("");
    return base44.entities.Order.list("-created_date", 30)
      .then(setOrders)
      .catch((err) => setError(err?.message || "Your orders could not be loaded."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <p className="eyebrow">Your account</p>
      <h1 className="mt-3 text-3xl">Orders</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Each seller packs their own parcel. UnterSous handles pickup and delivery; its connection to this preview is not active.
      </p>

      {error && (
        <div className="mt-6 rounded-xl bg-destructive/10 p-4" role="alert">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" className="mt-3 rounded-full" onClick={loadOrders}>Try again</Button>
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading your orders…</p>
      ) : error ? null : orders.length === 0 ? (
        <div className="sweet-card mt-8 p-10 text-center">
          <PackageOpen className="mx-auto h-6 w-6 text-primary/50" />
          <p className="mt-4 font-heading text-xl">No orders yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your first pantry order will appear here with its packing and delivery progress.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/browse">Browse the pantry</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to="/orders/$orderId"
                params={{ orderId: order.id }}
                className="sweet-card flex flex-wrap items-center justify-between gap-4 p-5 transition-shadow hover:sugar-shadow"
              >
                <div>
                  <p className="font-heading text-lg">{order.reference}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.created_date)} · {order.item_count} items · {order.seller_count}{" "}
                    {order.seller_count === 1 ? "shop" : "shops"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusPill status={order.status} map={ORDER_STATUS} />
                  <span className="text-sm font-semibold">{formatMoney(order.total_cents)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Truck } from "lucide-react";
import { getOrderDetail } from "@/lib/order-fns";
import { formatDate, formatMoney } from "@/lib/format";
import { ORDER_STATUS } from "@/lib/catalog";
import StatusPill from "@/components/site/StatusPill";

export const Route = createFileRoute("/_authed/orders/$orderId")({
  loader: ({ params }) => getOrderDetail({ data: { order_id: params.orderId } }),
  head: () => ({ meta: [{ title: "Order — Sweet Shop" }] }),
  component: OrderDetailPage,
});

const SHIPMENT_STEPS = ["placed", "packing", "ready_for_pickup", "collected", "delivered"];

function OrderDetailPage() {
  const { order, items, shipments, viewer_role: viewerRole } = Route.useLoaderData();
  const sellerView = viewerRole === "seller";

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-2xl">That order could not be found</h1>
        <Link to="/orders" className="mt-4 inline-block text-sm text-primary">
          Back to your orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Link to="/orders" className="text-xs font-medium text-primary/80 hover:text-primary">
        ← All orders
      </Link>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Order {order.reference}</p>
          <h1 className="mt-2 text-3xl">Placed {formatDate(order.created_date)}</h1>
        </div>
        <StatusPill status={order.status} map={ORDER_STATUS} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <section className="sweet-card p-6">
            <h2 className="font-heading text-xl">What's coming</h2>
            <ul className="mt-4 divide-y divide-border/60">
              {items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {item.quantity} × {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.seller_name}
                      {item.is_on_demand ? ` · made to order, ${item.lead_time_days} days` : ""}
                    </p>
                    {item.maker_compensation_cents > 0 && (
                      <p className="mt-1 text-xs text-primary/80">
                        Recorded maker compensation rate: {formatMoney(item.maker_compensation_cents)} per item; payment is not confirmed
                      </p>
                    )}
                  </div>
                  <p className="text-sm">{formatMoney(item.list_price_cents * item.quantity)}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="sweet-card p-6">
            <h2 className="flex items-center gap-2 font-heading text-xl">
              <Truck className="h-4 w-4 text-primary/70" /> Parcels
            </h2>
            <div className="mt-4 space-y-4">
              {shipments.map((shipment) => {
                const current = SHIPMENT_STEPS.indexOf(shipment.status);
                return (
                  <div key={shipment.id} className="rounded-2xl border border-border/70 bg-white/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">{shipment.seller_name}</p>
                      <StatusPill status={shipment.status} map={ORDER_STATUS} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{shipment.item_summary}</p>
                    <div className="mt-3 flex items-center gap-1.5">
                      {SHIPMENT_STEPS.map((step, index) => (
                        <span
                          key={step}
                          className={`h-1.5 flex-1 rounded-full ${
                            index <= current ? "bg-primary/60" : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    {shipment.pickup_code && (
                      <p className="mt-2 text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">
                        Pickup code {shipment.pickup_code}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          {sellerView ? (
            <section className="sweet-card p-6 text-sm">
              <h2 className="font-heading text-lg">Seller order view</h2>
              <p className="mt-3 text-muted-foreground">
                Only this seller's items and pickup code are shown. Buyer contact and delivery details are not shared with sellers.
              </p>
            </section>
          ) : (
            <>
              <section className="sweet-card p-6">
                <h2 className="font-heading text-lg">Total</h2>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Goods at listed price</dt>
                    <dd>{formatMoney(order.goods_total_cents)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Delivery</dt>
                    <dd>{formatMoney(order.delivery_fee_cents)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-2 font-semibold">
                    <dt>Order total</dt>
                    <dd>{formatMoney(order.total_cents)}</dd>
                  </div>
                </dl>
                <p className="mt-4 flex items-start gap-2 rounded-2xl bg-muted/70 p-3 text-xs leading-relaxed text-muted-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {order.payment_status === "paid"
                    ? "Payment confirmed at checkout."
                    : "Payment has not been confirmed."}
                </p>
              </section>

              <section className="sweet-card p-6 text-sm">
                <h2 className="font-heading text-lg">Delivering to</h2>
                <p className="mt-3 text-muted-foreground">
                  {order.buyer_name}
                  <br />
                  {order.address_line1}
                  {order.address_line2 ? (
                    <>
                      <br />
                      {order.address_line2}
                    </>
                  ) : null}
                  <br />
                  {order.city} · {order.postcode}
                  <br />
                  {order.country}
                </p>
                {order.delivery_notes && (
                  <p className="mt-3 text-xs text-muted-foreground">“{order.delivery_notes}”</p>
                )}
              </section>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
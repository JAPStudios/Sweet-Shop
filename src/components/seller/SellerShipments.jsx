import { Link } from "@tanstack/react-router";
import { ORDER_STATUS } from "@/lib/catalog";
import StatusPill from "@/components/site/StatusPill";
import { Button } from "@/components/ui/button";

export default function SellerShipments({ shipments, onUpdate, busyId }) {
  if (shipments.length === 0) {
    return (
      <div className="sweet-card p-8 text-center">
        <p className="font-heading text-xl">Nothing to pack right now</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Seller parcels will appear here when order handling is enabled.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {shipments.map((shipment) => (
        <li key={shipment.id} className="sweet-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-heading text-lg">
                <Link to="/orders/$orderId" params={{ orderId: shipment.order_id }}>
                  {shipment.order_reference}
                </Link>
              </p>
              <p className="mt-1 text-sm text-foreground/80">{shipment.item_summary}</p>
              {shipment.pickup_code && (
                <p className="mt-1 text-xs text-muted-foreground">Pickup reference {shipment.pickup_code}</p>
              )}
            </div>
            <div className="text-right">
              <StatusPill status={shipment.status} map={ORDER_STATUS} />
 
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {shipment.status === "placed" && (
              <Button
                size="sm"
                className="rounded-full"
                disabled={busyId === shipment.id}
                onClick={() => onUpdate(shipment, "packing")}
              >
                Start packing
              </Button>
            )}
            {shipment.status === "packing" && (
              <Button
                size="sm"
                className="rounded-full"
                disabled={busyId === shipment.id}
                onClick={() => onUpdate(shipment, "ready_for_pickup")}
              >
                Mark ready for pickup
              </Button>
            )}
            {shipment.status === "ready_for_pickup" && (
              <p className="text-xs text-muted-foreground">
                Marked ready for pickup. UnterSous collection updates are not connected in this preview.
              </p>
            )}
            {shipment.status === "collected" && (
              <p className="text-xs text-muted-foreground">Collection recorded.</p>
            )}
            {shipment.status === "delivered" && (
              <p className="text-xs text-muted-foreground">Delivery recorded.</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { syncOrderStatus } from "@/lib/order-fns";

function assertDriver(user) {
  if (user.role !== "admin" && user.role !== "driver") {
    throw Object.assign(new Error("Driver access is required."), { status: 403 });
  }
}

const formatPickupAddress = (profile) =>
  [
    profile?.pickup_address_line1,
    profile?.pickup_address_line2,
    profile?.pickup_city,
    profile?.pickup_region,
    profile?.pickup_postcode,
    profile?.pickup_country,
  ]
    .filter(Boolean)
    .join(", ");

const toParcel = (shipment) => ({
  id: shipment.id,
  seller_name: shipment.seller_name,
  order_reference: shipment.order_reference,
  item_summary: shipment.item_summary,
  item_count: shipment.item_count ?? 0,
  pickup_code: shipment.pickup_code ?? "",
  status: shipment.status,
});

export const listPickupBoard = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    assertDriver(context.user);
    const svc = context.getBase44().asServiceRole;
    const shipments = await svc.entities.Shipment.filter(
      { status: { $in: ["ready_for_pickup", "collected"] } },
      "created_date",
      200,
    );

    const profiles = new Map();
    const orders = new Map();
    const locations = new Map();
    const inTransit = [];

    for (const shipment of shipments) {
      if (!orders.has(shipment.order_id)) {
        orders.set(
          shipment.order_id,
          await svc.entities.Order.get(shipment.order_id).catch(() => null),
        );
      }
      const order = orders.get(shipment.order_id);
      if (!order || order.payment_status !== "paid" || order.status === "cancelled") continue;
      if (shipment.status === "collected") {
        inTransit.push(toParcel(shipment));
        continue;
      }
      if (!profiles.has(shipment.seller_id)) {
        const rows = await svc.entities.SellerProfile.filter({ created_by_id: shipment.seller_id });
        profiles.set(shipment.seller_id, rows[0] ?? null);
      }
      const profile = profiles.get(shipment.seller_id);
      const key = shipment.pickup_location_key || profile?.pickup_location_key || shipment.seller_id;
      if (!locations.has(key)) {
        locations.set(key, {
          key,
          address: formatPickupAddress(profile) || "Pickup address not recorded",
          parcels: [],
        });
      }
      locations.get(key).parcels.push(toParcel(shipment));
    }

    return { locations: [...locations.values()], inTransit };
  });

export const collectShipments = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ shipment_ids: z.array(z.string().min(1)).min(1).max(50) }))
  .handler(async ({ data, context }) => {
    assertDriver(context.user);
    const svc = context.getBase44().asServiceRole;
    const now = new Date().toISOString();
    const orderIds = new Set();
    let collected = 0;
    for (const id of data.shipment_ids) {
      const shipment = await svc.entities.Shipment.get(id).catch(() => null);
      if (!shipment || shipment.status !== "ready_for_pickup") continue;
      const order = await svc.entities.Order.get(shipment.order_id).catch(() => null);
      if (!order || order.payment_status !== "paid" || order.status === "cancelled") continue;
      await svc.entities.Shipment.update(shipment.id, { status: "collected", collected_at: now });
      orderIds.add(shipment.order_id);
      collected += 1;
    }
    for (const orderId of orderIds) {
      await syncOrderStatus(svc, orderId);
    }
    return { collected };
  });

export const deliverShipment = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ shipment_id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    assertDriver(context.user);
    const svc = context.getBase44().asServiceRole;
    const shipment = await svc.entities.Shipment.get(data.shipment_id).catch(() => null);
    if (!shipment || shipment.status !== "collected") {
      throw Object.assign(new Error("This parcel is not out for delivery."), { status: 409 });
    }
    const order = await svc.entities.Order.get(shipment.order_id).catch(() => null);
    if (!order || order.payment_status !== "paid" || order.status === "cancelled") {
      throw Object.assign(new Error("This parcel cannot be delivered because its payment is not confirmed."), { status: 409 });
    }
    const orderShipments = await svc.entities.Shipment.filter({ order_id: order.id });
    const allParcelsCollected = orderShipments.every(
      (parcel) => parcel.status === "collected" || parcel.status === "delivered",
    );
    if (!allParcelsCollected) {
      throw Object.assign(
        new Error("Collect every seller parcel for this order before starting delivery."),
        { status: 409 },
      );
    }
    await svc.entities.Shipment.update(shipment.id, {
      status: "delivered",
      delivered_at: new Date().toISOString(),
    });
    await syncOrderStatus(svc, shipment.order_id);
    return { ok: true };
  });
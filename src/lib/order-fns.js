import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

const RANK = { placed: 0, packing: 1, ready_for_pickup: 2, collected: 3, delivered: 4 };

export async function syncOrderStatus(svc, orderId) {
  const shipments = await svc.entities.Shipment.filter({ order_id: orderId });
  const list = shipments;
  if (list.length === 0) return;
  let status = "placed";
  if (list.every((s) => s.status === "delivered")) status = "delivered";
  else if (list.every((s) => RANK[s.status] >= RANK.collected)) status = "in_transit";
  else if (list.every((s) => RANK[s.status] >= RANK.ready_for_pickup)) status = "ready_for_pickup";
  else if (list.some((s) => s.status === "packing")) status = "packing";

  await svc.entities.Order.update(orderId, { status });
}

async function loadOrderLines(svc, items) {
  const wanted = new Map();
  for (const item of items) {
    wanted.set(item.product_id, (wanted.get(item.product_id) ?? 0) + item.quantity);
  }
  const lines = [];
  for (const [productId, quantity] of wanted) {
    const product = await svc.entities.Product.get(productId).catch(() => null);
    if (!product || product.verification_status !== "verified") {
      throw Object.assign(new Error("A listing in your basket is no longer available."), { status: 400 });
    }
    if (!product.is_on_demand && (product.stock ?? 0) < quantity) {
      throw Object.assign(new Error(`Not enough stock left for ${product.title}.`), { status: 400 });
    }
    lines.push({ product, quantity });
  }
  return lines;
}

async function buildDeliveryQuote(svc, lines) {
  const settingsResult = await svc.entities.DeliverySettings.filter({ enabled: true }, "-created_date", 1);
  const settingsList = settingsResult;
  const settings = settingsList[0];
  if (!settings) return { available: false, message: "Delivery rates have not been configured." };

  const sellerIds = [...new Set(lines.map((line) => line.product.seller_id))];
  const profiles = new Map();
  for (const sellerId of sellerIds) {
    const result = await svc.entities.SellerProfile.filter({ created_by_id: sellerId });
    const rows = result;
    const profile = rows[0];
    if (!profile?.pickup_location_key || !profile.pickup_address_line1 || !profile.pickup_city || !profile.pickup_postcode || !profile.pickup_country) {
      return {
        available: false,
        message: `Pickup location is incomplete for ${profile?.shop_name || "a seller"}.`,
      };
    }
    profiles.set(sellerId, profile);
  }

  const locationKeys = [...new Set(sellerIds.map((id) => profiles.get(id).pickup_location_key))];
  const baseFee = Number(settings.base_fee_cents);
  const additionalFee = Number(settings.additional_pickup_fee_cents);
  if (!Number.isInteger(baseFee) || baseFee < 0 || !Number.isInteger(additionalFee) || additionalFee < 0) {
    return { available: false, message: "The delivery rate schedule is invalid." };
  }
  return {
    available: true,
    delivery_fee_cents: baseFee + Math.max(0, locationKeys.length - 1) * additionalFee,
    pickup_count: locationKeys.length,
    seller_count: sellerIds.length,
    base_fee_cents: baseFee,
    additional_pickup_fee_cents: additionalFee,
    profiles,
  };
}

export const getDeliveryQuote = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({
    items: z.array(
      z.object({
        product_id: z.string().min(1),
        quantity: z.number().int().min(1),
      }),
    ).min(1),
  }))
  .handler(async ({ data, context }) => {
    const svc = context.getBase44().asServiceRole;
    const lines = await loadOrderLines(svc, data.items);
    const quote = await buildDeliveryQuote(svc, lines);
    if (!quote.available) return quote;
    return {
      available: true,
      delivery_fee_cents: quote.delivery_fee_cents,
      pickup_count: quote.pickup_count,
      seller_count: quote.seller_count,
    };
  });

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      items: z.array(z.object({ product_id: z.string().min(1).max(128), quantity: z.number().int().min(1) })).min(1).max(50),
      contact_name: z.string().min(2).max(80),
      contact_phone: z.string().max(30).optional(),
      address_line1: z.string().min(3).max(120),
      address_line2: z.string().max(120).optional(),
      city: z.string().min(2).max(80),
      postcode: z.string().min(2).max(20),
      country: z.string().min(2).max(60),
      delivery_notes: z.string().max(300).optional(),
    }),
  )
  .handler(async () => {
    throw Object.assign(
      new Error(
        "Checkout is closed: Base44 currently reports that its Wix Payments connection is unavailable for this account or country. No payment can be confirmed, so no order was created, no stock was reserved and no parcel was passed to a seller.",
      ),
      { status: 503 },
    );
  });

export const getOrderDetail = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ order_id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const asUser = context.getBase44();
    const isAdmin = context.user.role === "admin";
    const buyerVisibleOrder = await asUser.entities.Order.get(data.order_id).catch(() => null);

    if (
      buyerVisibleOrder &&
      (buyerVisibleOrder.created_by_id === context.user.id || isAdmin)
    ) {
      const items = await asUser.entities.OrderItem.filter({ order_id: buyerVisibleOrder.id });
      const shipments = await asUser.asServiceRole.entities.Shipment.filter({
        order_id: buyerVisibleOrder.id,
      });
      return {
        order: buyerVisibleOrder,
        items,
        shipments: shipments.map((shipment) => ({
          id: shipment.id,
          seller_name: shipment.seller_name,
          status: shipment.status,
          item_summary: shipment.item_summary,
          ...(isAdmin ? { pickup_code: shipment.pickup_code } : {}),
        })),
        viewer_role: isAdmin ? "admin" : "buyer",
      };
    }

    const sellerItems = await asUser.entities.OrderItem
      .filter({ order_id: data.order_id })
      .catch(() => []);
    const visibleItems = sellerItems.filter((item) => item.seller_id === context.user.id);
    if (visibleItems.length === 0) {
      throw Object.assign(new Error("Order not found"), { status: 404 });
    }

    const svc = asUser.asServiceRole;
    const order = await svc.entities.Order.get(data.order_id).catch(() => null);
    if (!order || order.payment_status !== "paid" || order.status === "cancelled") {
      throw Object.assign(new Error("Order not found"), { status: 404 });
    }
    const shipments = await svc.entities.Shipment.filter({ order_id: order.id });
    const visibleShipments = shipments.filter((shipment) => shipment.seller_id === context.user.id);

    return {
      order: {
        id: order.id,
        reference: order.reference,
        status: order.status,
        created_date: order.created_date,
      },
      items: visibleItems,
      shipments: visibleShipments.map((shipment) => ({
        id: shipment.id,
        seller_name: shipment.seller_name,
        status: shipment.status,
        item_summary: shipment.item_summary,
        pickup_code: shipment.pickup_code,
      })),
      viewer_role: "seller",
    };
  });

export const updateShipmentStatus = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ shipment_id: z.string().min(1), status: z.enum(["packing", "ready_for_pickup"]) }))
  .handler(async ({ data, context }) => {
    const asUser = context.getBase44();
    const shipment = await asUser.entities.Shipment.get(data.shipment_id).catch(() => null);
    if (!shipment) throw Object.assign(new Error("Shipment not found"), { status: 404 });
    if (shipment.seller_id !== context.user.id && context.user.role !== "admin") {
      throw Object.assign(new Error("Only the seller can update this shipment"), { status: 403 });
    }
    const svc = asUser.asServiceRole;
    const order = await svc.entities.Order.get(shipment.order_id).catch(() => null);
    if (!order || order.payment_status !== "paid" || order.status === "cancelled") {
      throw Object.assign(new Error("This shipment cannot be processed before payment is confirmed."), { status: 409 });
    }
    const allowedTransition = data.status === "packing"
      ? ["placed", "packing"].includes(shipment.status)
      : ["packing", "ready_for_pickup"].includes(shipment.status);
    if (!allowedTransition) {
      throw Object.assign(new Error("This parcel has already advanced beyond that packing status."), { status: 409 });
    }
    await svc.entities.Shipment.update(shipment.id, {
      status: data.status,
      packed_at: data.status === "ready_for_pickup" ? new Date().toISOString() : shipment.packed_at,
    });
    await syncOrderStatus(svc, shipment.order_id);
    return { ok: true };
  });
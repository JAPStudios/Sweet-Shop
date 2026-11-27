import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

function assertAdmin(user) {
  if (user.role !== "admin") {
    throw Object.assign(new Error("Administrator access is required."), { status: 403 });
  }
}

export const getDeliverySettings = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    assertAdmin(context.user);
    const svc = context.getBase44().asServiceRole;
    const result = await svc.entities.DeliverySettings.filter({}, "-created_date", 1);
    const rows = result;
    return { settings: rows[0] ?? null };
  });

export const saveDeliverySettings = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      base_fee_cents: z.number().int().min(0),
      additional_pickup_fee_cents: z.number().int().min(0),
      currency: z.string().length(3).default("USD"),
      enabled: z.boolean(),
    }),
  )
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    const asUser = context.getBase44();
    const result = await asUser.entities.DeliverySettings.filter({}, "-created_date", 1);
    const rows = result;
    const payload = {
      base_fee_cents: data.base_fee_cents,
      additional_pickup_fee_cents: data.additional_pickup_fee_cents,
      currency: data.currency.toUpperCase(),
      enabled: data.enabled,
    };
    const settings = rows[0]
      ? await asUser.entities.DeliverySettings.update(rows[0].id, payload)
      : await asUser.entities.DeliverySettings.create(payload);
    return { settings };
  });

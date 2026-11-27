import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

export const submitProductForVerification = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ product_id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const svc = context.getBase44().asServiceRole;
    const product = await svc.entities.Product.get(data.product_id).catch(() => null);
    if (!product) throw Object.assign(new Error("Listing not found."), { status: 404 });
    if (product.created_by_id !== context.user.id) {
      throw Object.assign(new Error("Only the seller who created this listing can submit it."), { status: 403 });
    }
    if (product.verification_status !== "draft" && product.verification_status !== "rejected") {
      throw Object.assign(new Error("This listing cannot be submitted from its current status."), { status: 409 });
    }
    const updated = await svc.entities.Product.update(product.id, {
      verification_status: "pending",
      test_completed: false,
      legitimacy_confirmed: false,
      test_notes: "",
      verification_notes: "",
      verified_at: "",
      verified_by: "",
    });
    return { product: updated };
  });

export const reviewProduct = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      product_id: z.string().min(1),
      decision: z.enum(["verified", "rejected"]),
      test_completed: z.boolean(),
      legitimacy_confirmed: z.boolean(),
      test_notes: z.string().max(2000).optional(),
      verification_notes: z.string().max(1000).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (context.user.role !== "admin") {
      throw Object.assign(new Error("Administrator access is required."), { status: 403 });
    }
    if (data.decision === "verified") {
      if (!data.test_completed || !data.legitimacy_confirmed || (data.test_notes ?? "").trim().length < 10) {
        throw Object.assign(
          new Error("Approval requires completed testing, confirmed legitimacy and a written test record."),
          { status: 400 },
        );
      }
    } else if ((data.verification_notes ?? "").trim().length < 3) {
      throw Object.assign(new Error("Add a rejection reason for the seller."), { status: 400 });
    }

    const svc = context.getBase44().asServiceRole;
    const product = await svc.entities.Product.get(data.product_id).catch(() => null);
    if (!product || product.verification_status !== "pending") {
      throw Object.assign(new Error("This listing is no longer awaiting review."), { status: 409 });
    }
    const updated = await svc.entities.Product.update(product.id, {
      verification_status: data.decision,
      test_completed: data.decision === "verified" && data.test_completed,
      legitimacy_confirmed: data.decision === "verified" && data.legitimacy_confirmed,
      test_notes: data.test_notes ?? "",
      verification_notes: data.verification_notes ?? (data.decision === "verified" ? "Testing completed and legitimacy confirmed." : ""),
      verified_at: data.decision === "verified" ? new Date().toISOString() : "",
      verified_by: data.decision === "verified" ? context.user.id : "",
    });
    return { product: updated };
  });

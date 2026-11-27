import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

const PUBLIC_PRODUCT_FIELDS = [
  "id", "title", "description", "category", "price_cents", "compare_at_price_cents",
  "image_url", "images", "seller_id", "seller_name", "badge", "rating",
  "verification_status", "provenance", "maker_type", "maker_name",
  "maker_compensation_cents", "is_on_demand", "lead_time_days", "stock", "source",
];

const toPublicProduct = (product) =>
  Object.fromEntries(
    PUBLIC_PRODUCT_FIELDS
      .filter((field) => product[field] !== undefined)
      .map((field) => [field, product[field]]),
  );

const normalizePickupLocation = (data) =>
  [
    data.pickup_address_line1,
    data.pickup_address_line2,
    data.pickup_city,
    data.pickup_region,
    data.pickup_postcode,
    data.pickup_country,
  ]
    .map((part) => (part || "").trim().toLowerCase().replace(/\s+/g, " "))
    .filter(Boolean)
    .join("|");

export const listMarketplace = createServerFn({ method: "GET" })
  .validator(
    z.object({
      category: z.string().max(80).optional(),
      q: z.string().max(80).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const query = { verification_status: "verified" };
    if (data.category) query.category = data.category;
    if (data.q && data.q.trim()) {
      const regexMetacharacters = [".", "*", "+", "?", "^", "$", "{", "}", "(", ")", "|", "[", "]", String.fromCharCode(92)];
      const term = data.q.trim().split("").map((character) =>
        regexMetacharacters.includes(character) ? String.fromCharCode(92) + character : character,
      ).join("");
      query.$or = [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { seller_name: { $regex: term, $options: "i" } },
        { category: { $regex: term, $options: "i" } },
      ];
    }

    const asUser = context.getBase44();
    const [products, categoryProducts] = await Promise.all([
      asUser.entities.Product.filter(query, "-created_date", 60),
      asUser.entities.Product.filter({ verification_status: "verified" }, "-created_date", 500),
    ]);
    const categories = [...new Set(
      categoryProducts
        .map((product) => product.category)
        .filter((category) => typeof category === "string" && category.trim().length > 0),
    )].sort((a, b) => a.localeCompare(b));
    return { products: products.map(toPublicProduct), categories };
  });

export const getProduct = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    try {
      const product = await context.getBase44().entities.Product.get(data.id);
      return {
        product: product?.verification_status === "verified" ? toPublicProduct(product) : null,
      };
    } catch (error) {
      if (error?.status === 404 || error?.status === 403) return { product: null };
      throw error;
    }
  });

export const getUnionStats = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const verifiedProducts = await context.getBase44().entities.Product.filter(
    { verification_status: "verified" },
    "-created_date",
    500,
  );
  const sellers = new Set(verifiedProducts.map((product) => product.seller_id).filter(Boolean));
  return { sellers: sellers.size, listings: verifiedProducts.length };
});

export const saveSellerProfile = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      shop_name: z.string().min(2).max(80),
      contact_address: z.string().max(120).optional(),
      bio: z.string().max(600).optional(),
      city: z.string().max(80).optional(),
      country: z.string().max(80).optional(),
      maker_type: z.enum(["self", "incarcerated_artisan", "organisation"]),
      pickup_address_line1: z.string().min(3).max(120),
      pickup_address_line2: z.string().max(120).optional(),
      pickup_city: z.string().min(2).max(80),
      pickup_region: z.string().max(80).optional(),
      pickup_postcode: z.string().min(2).max(20),
      pickup_country: z.string().min(2).max(80),
    }),
  )
  .handler(async ({ data, context }) => {
    const asUser = context.getBase44();
    const existing = await asUser.entities.SellerProfile.filter({ created_by_id: context.user.id });
    const payload = {
      ...data,
      pickup_location_key: normalizePickupLocation(data),
      union_member: true,
    };
    if (existing.length > 0) {
      return { profile: await asUser.entities.SellerProfile.update(existing[0].id, payload) };
    }
    return { profile: await asUser.entities.SellerProfile.create(payload) };
  });

// A worker may list on behalf of their employer only while that membership is
// active, so revoking a membership ends their ability to create or edit those listings.
const resolveOrganisation = async (asUser, user, organisationId) => {
  if (!organisationId) return null;
  const email = String(user.email ?? "").trim().toLowerCase();
  const memberships = await asUser.entities.OrganisationMember.filter({
    organisation_id: organisationId,
    worker_email: email,
  });
  if (!memberships.some((row) => row.status === "active")) {
    throw Object.assign(
      new Error("Your membership of that organisation is not active, so you cannot list on its behalf."),
      { status: 403 },
    );
  }
  const organisation = await asUser.entities.Organisation.get(organisationId).catch(() => null);
  if (!organisation || organisation.status === "suspended") {
    throw Object.assign(new Error("That organisation account cannot publish listings."), { status: 403 });
  }
  return organisation;
};

const listingFields = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  price_cents: z.number().int().min(0),
  compare_at_price_cents: z.number().int().min(0).optional(),
  image_url: z.string().optional(),
  provenance: z.string().optional(),
  organisation_id: z.string().max(128).optional(),
  maker_type: z.enum(["self", "incarcerated_artisan", "organisation"]),
  maker_name: z.string().optional(),
  maker_compensation_cents: z.number().int().min(0).optional(),
  is_on_demand: z.boolean(),
  lead_time_days: z.number().int().min(1).optional(),
  stock: z.number().int().min(0),
  source: z.enum(["native", "imported"]).optional(),
});

const enforceListingRules = (schema) =>
  schema.superRefine((data, ctx) => {
    if (data.maker_type === "incarcerated_artisan" && (!data.maker_compensation_cents || data.maker_compensation_cents <= 0)) {
      ctx.addIssue({ code: "custom", path: ["maker_compensation_cents"], message: "A positive maker compensation rate is required for incarcerated-artisan listings." });
    }
    if (data.is_on_demand) {
      if (!data.lead_time_days || data.lead_time_days < 1) {
        ctx.addIssue({ code: "custom", path: ["lead_time_days"], message: "Enter the maker's stated lead time." });
      }
      if (data.stock !== 0) {
        ctx.addIssue({ code: "custom", path: ["stock"], message: "Made-to-order listings must not claim stocked inventory." });
      }
    } else if (data.stock < 1) {
      ctx.addIssue({ code: "custom", path: ["stock"], message: "Enter the available stock quantity." });
    }
  });

export const createProduct = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(enforceListingRules(listingFields))
  .handler(async ({ data, context }) => {
    const asUser = context.getBase44();
    const profiles = await asUser.entities.SellerProfile.filter({ created_by_id: context.user.id });
    const profile = profiles[0];
    if (!profile) {
      throw Object.assign(new Error("Create your shop before listing goods."), { status: 400 });
    }
    const organisation = await resolveOrganisation(asUser, context.user, data.organisation_id);
    const product = await asUser.entities.Product.create({
      ...data,
      provenance: data.provenance ?? "",
      organisation_id: organisation?.id ?? "",
      organisation_name: organisation?.name ?? "",
      source: data.source ?? "native",
      seller_id: context.user.id,
      seller_name: profile.shop_name,
      verification_status: "draft",
      test_completed: false,
      legitimacy_confirmed: false,
      test_notes: "",
      verified_at: "",
      verified_by: "",
      badge: data.is_on_demand ? "On demand" : "",
      rating: 0,
    });
    return { product };
  });

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    enforceListingRules(
      listingFields.omit({ source: true }).extend({ product_id: z.string().min(1) }),
    ),
  )
  .handler(async ({ data, context }) => {
    const asUser = context.getBase44();
    const product = await asUser.entities.Product.get(data.product_id).catch(() => null);
    if (!product || product.created_by_id !== context.user.id) {
      throw Object.assign(new Error("Listing not found."), { status: 404 });
    }
    if (product.verification_status !== "draft" && product.verification_status !== "rejected") {
      throw Object.assign(new Error("Only draft or rejected listings can be edited."), { status: 409 });
    }
    const profiles = await asUser.entities.SellerProfile.filter({ created_by_id: context.user.id });
    const profile = profiles[0];
    if (!profile) {
      throw Object.assign(new Error("Create your shop before editing goods."), { status: 400 });
    }
    const organisation = await resolveOrganisation(asUser, context.user, data.organisation_id);
    const { product_id, ...fields } = data;
    const update = Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== undefined),
    );
    update.organisation_id = organisation?.id ?? "";
    update.organisation_name = organisation?.name ?? "";
    update.image_url = fields.image_url ?? product.image_url ?? "";
    update.compare_at_price_cents = fields.compare_at_price_cents ?? 0;
    update.maker_name = fields.maker_name ?? "";
    update.maker_compensation_cents = fields.maker_compensation_cents ?? 0;
    update.lead_time_days = fields.is_on_demand ? fields.lead_time_days : 0;
    update.source = product.source ?? "native";
    update.seller_id = context.user.id;
    update.seller_name = profile.shop_name;
    update.verification_status = "draft";
    update.test_completed = false;
    update.legitimacy_confirmed = false;
    update.test_notes = "";
    update.verification_notes = "";
    update.verified_at = "";
    update.verified_by = "";
    update.badge = fields.is_on_demand ? "On demand" : "";
    return { product: await asUser.asServiceRole.entities.Product.update(product.id, update) };
  });

export const importProducts = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      rows: z.array(enforceListingRules(listingFields.omit({ source: true }))).min(1).max(50),
    }),
  )
  .handler(async ({ data, context }) => {
    const asUser = context.getBase44();
    const profiles = await asUser.entities.SellerProfile.filter({ created_by_id: context.user.id });
    const profile = profiles[0];
    if (!profile) {
      throw Object.assign(new Error("Create your shop before importing goods."), { status: 400 });
    }
    const created = await asUser.entities.Product.bulkCreate(
      data.rows.map((row) => ({
        ...row,
        provenance: row.provenance ?? "",
        seller_id: context.user.id,
        seller_name: profile.shop_name,
        verification_status: "draft",
        source: "imported",
        test_completed: false,
        legitimacy_confirmed: false,
        test_notes: "",
        verified_at: "",
        verified_by: "",
        badge: row.is_on_demand ? "On demand" : "",
        rating: 0,
      })),
    );
    return { imported: created?.length ?? data.rows.length };
  });
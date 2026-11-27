import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { createProduct, updateProduct } from "@/lib/server-fns";
import { getMyMemberships } from "@/lib/organisation-fns";
import { CATEGORIES, MAKER_TYPES } from "@/lib/catalog";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authed/seller/new")({
  validateSearch: (search) => ({
    productId: typeof search.productId === "string" ? search.productId : undefined,
  }),
  head: () => ({ meta: [{ title: "Listing — Sweet Shop" }] }),
  component: NewListingPage,
});

const initial = {
  title: "",
  description: "",
  category: "pantry",
  price: "",
  compare: "",
  provenance: "",
  maker_type: "self",
  maker_name: "",
  compensation: "",
  is_on_demand: false,
  lead_time_days: "",
  stock: "",
};

function NewListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { productId } = Route.useSearch();
  const create = useServerFn(createProduct);
  const updateProductFn = useServerFn(updateProduct);
  const loadMemberships = useServerFn(getMyMemberships);
  const [form, setForm] = useState(initial);
  const [memberships, setMemberships] = useState([]);
  const [organisationId, setOrganisationId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [hasShop, setHasShop] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(Boolean(productId));
  const [canEditExisting, setCanEditExisting] = useState(!productId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.SellerProfile
      .filter({ created_by_id: user.id })
      .then((profiles) => setHasShop(profiles.length > 0));
    loadMemberships()
      .then((result) => setMemberships(result.memberships))
      .catch(() => setMemberships([]));
  }, [user?.id]);

  useEffect(() => {
    if (!productId || !user?.id) return;
    setLoadingExisting(true);
    base44.entities.Product.get(productId)
      .then((product) => {
        if (product.created_by_id !== user.id) {
          throw new Error("This listing does not belong to this seller account.");
        }
        if (product.verification_status !== "draft" && product.verification_status !== "rejected") {
          throw new Error("Only draft or rejected listings can be edited.");
        }
        setForm({
          title: product.title ?? "",
          description: product.description ?? "",
          category: product.category ?? "pantry",
          price: ((product.price_cents ?? 0) / 100).toFixed(2),
          compare: product.compare_at_price_cents ? (product.compare_at_price_cents / 100).toFixed(2) : "",
          provenance: product.provenance ?? "",
          maker_type: product.maker_type ?? "self",
          maker_name: product.maker_name ?? "",
          compensation: product.maker_compensation_cents ? (product.maker_compensation_cents / 100).toFixed(2) : "",
          is_on_demand: !!product.is_on_demand,
          lead_time_days: product.lead_time_days ? String(product.lead_time_days) : "",
          stock: product.stock !== undefined ? String(product.stock) : "",
        });
        setImageUrl(product.image_url ?? "");
        setOrganisationId(product.organisation_id ?? "");
        setCanEditExisting(true);
      })
      .catch((err) => setError(err?.message || "This listing could not be loaded."))
      .finally(() => setLoadingExisting(false));
  }, [productId, user?.id]);

  const update = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      if (!file_url) throw new Error("The image upload did not return a public image URL.");
      setImageUrl(file_url);
    } catch (err) {
      setError(err?.message || "The listing photo could not be uploaded.");
      event.target.value = "";
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = {
          title: form.title,
          description: form.description,
          category: form.category,
          price_cents: Math.round(Number(form.price || 0) * 100),
          compare_at_price_cents: form.compare ? Math.round(Number(form.compare) * 100) : undefined,
          image_url: imageUrl || undefined,
          provenance: form.provenance,
          organisation_id: organisationId || undefined,
          maker_type: form.maker_type,
          maker_name: form.maker_name || undefined,
          maker_compensation_cents: form.compensation
            ? Math.round(Number(form.compensation) * 100)
            : undefined,
          is_on_demand: form.is_on_demand,
          lead_time_days: form.is_on_demand ? Number(form.lead_time_days) : undefined,
          stock: form.is_on_demand ? 0 : Number(form.stock),
        };
      if (productId) {
        await updateProductFn({ data: { ...payload, product_id: productId } });
      } else {
        await create({ data: payload });
      }
      navigate({ to: "/seller" });
    } catch (err) {
      setError(err?.message || "We could not save that listing.");
    } finally {
      setBusy(false);
    }
  };

  if (loadingExisting) {
    return <div className="mx-auto max-w-3xl px-5 py-16 text-sm text-muted-foreground">Loading listing…</div>;
  }

  if (hasShop === false) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-2xl">Open a shop first</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Listings belong to a shop. Set yours up and come back.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/seller">Set up my shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link to="/seller" className="text-xs font-medium text-primary/80 hover:text-primary">
        ← Seller dashboard
      </Link>
      <h1 className="mt-4 text-3xl">{productId ? "Edit listing" : "New listing"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {productId ? "Changes are saved as a private draft. Submit the listing again for a new review." : "Saved as a private draft. It stays unpublished until a reviewer confirms legitimacy and records completed testing."}
      </p>

      <form onSubmit={submit} className="sweet-card mt-8 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="title">Listing name</Label>
            <Input id="title" value={form.title} onChange={update("title")} required minLength={1} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">What is it?</Label>
            <Textarea id="description" value={form.description} onChange={update("description")} required minLength={1} rows={3} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={form.category}
              onChange={update("category")}
              list="product-categories"
              required
              className="mt-1.5"
              placeholder="Enter any product category"
            />
            <datalist id="product-categories">
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </datalist>
          </div>
          <div>
            <Label htmlFor="price">Price (USD)</Label>
            <Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={update("price")} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="compare">Compare-at price (optional)</Label>
            <Input id="compare" type="number" min="0" step="0.01" value={form.compare} onChange={update("compare")} className="mt-1.5" />
          </div>

          <div className="sm:col-span-2">
            <Label>Photo</Label>
            <div className="mt-1.5 flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-2xl bg-muted">
                {imageUrl ? (
                  <Image src={imageUrl} alt="Listing" className="h-full w-full" fittingType="fill" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={upload}
                  className="text-xs file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {uploading ? "Uploading…" : "Photos are stored publicly — anyone with the link can open them."}
                </p>
              </div>
            </div>
          </div>

          {memberships.length > 0 && (
            <div className="sm:col-span-2">
              <Label htmlFor="organisation">List on behalf of</Label>
              <select
                id="organisation"
                value={organisationId}
                onChange={(event) => setOrganisationId(event.target.value)}
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Your own shop</option>
                {memberships.map((membership) => (
                  <option key={membership.id} value={membership.organisation_id}>
                    {membership.organisation_name}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Organisation listings are published under the organisation's name while your membership stays active.
              </p>
            </div>
          )}

          <div className="sm:col-span-2">
            <Label htmlFor="provenance">Provenance and how it is made</Label>
            <Textarea
              id="provenance"
              value={form.provenance}
              onChange={update("provenance")}
              rows={3}
              className="mt-1.5"
              placeholder="Optional details about materials, origin and how the item is made."
            />
          </div>

          <div>
            <Label htmlFor="maker_type">Made by</Label>
            <select
              id="maker_type"
              value={form.maker_type}
              onChange={update("maker_type")}
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {Object.entries(MAKER_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="maker_name">Maker's name (optional)</Label>
            <Input id="maker_name" value={form.maker_name} onChange={update("maker_name")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="compensation">Maker compensation rate per item (USD)</Label>
            <Input
              id="compensation"
              type="number"
              min="0.01"
              step="0.01"
              value={form.compensation}
              onChange={update("compensation")}
              required={form.maker_type === "incarcerated_artisan"}
              className="mt-1.5"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Required for incarcerated-artisan listings. This records a rate, not a completed payment.
            </p>
          </div>

          <label className="flex items-center gap-3 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.is_on_demand}
              onChange={(event) => setForm((current) => ({ ...current, is_on_demand: event.target.checked }))}
              className="h-4 w-4 rounded border-border"
            />
            Made to order — the maker starts after the order is placed
          </label>

          {form.is_on_demand ? (
            <div className="sm:col-span-2">
              <Label htmlFor="lead_time_days">Lead time (days)</Label>
              <Input id="lead_time_days" type="number" min="1" value={form.lead_time_days} onChange={update("lead_time_days")} required className="mt-1.5" />
            </div>
          ) : (
            <div className="sm:col-span-2">
              <Label htmlFor="stock">Available stock</Label>
              <Input id="stock" type="number" min="1" value={form.stock} onChange={update("stock")} required className="mt-1.5" />
            </div>
          )}
        </div>

        {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" className="mt-6 rounded-full" disabled={busy || uploading || !canEditExisting}>
          {busy ? "Saving…" : productId ? "Save changes" : "Save draft"}
        </Button>
      </form>
    </div>
  );
}
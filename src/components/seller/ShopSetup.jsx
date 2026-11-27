import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveSellerProfile } from "@/lib/server-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MAKER_TYPES } from "@/lib/catalog";

export default function ShopSetup({ onSaved, initialProfile = null, onCancel }) {
  const save = useServerFn(saveSellerProfile);
  const [form, setForm] = useState(() => ({
    shop_name: initialProfile?.shop_name ?? "",
    contact_address: initialProfile?.contact_address ?? "",
    bio: initialProfile?.bio ?? "",
    city: initialProfile?.city ?? "",
    country: initialProfile?.country ?? "United States",
    maker_type: initialProfile?.maker_type ?? "self",
    pickup_address_line1: initialProfile?.pickup_address_line1 ?? "",
    pickup_address_line2: initialProfile?.pickup_address_line2 ?? "",
    pickup_city: initialProfile?.pickup_city ?? "",
    pickup_region: initialProfile?.pickup_region ?? "",
    pickup_postcode: initialProfile?.pickup_postcode ?? "",
    pickup_country: initialProfile?.pickup_country ?? "United States",
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { profile } = await save({ data: form });
      onSaved(profile);
    } catch (err) {
      setError(err?.message || "We could not open your shop. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="sweet-card mx-auto mt-8 max-w-2xl p-6 sm:p-8">
      <h2 className="font-heading text-2xl">Open your shop</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Every Digital Pantry account is a union member. Opening a shop and submitting listings carries no Digital Pantry listing fee. Submitted listings remain private until a reviewer confirms legitimacy and records completed testing.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="shop_name">Shop name</Label>
          <Input id="shop_name" value={form.shop_name} onChange={update("shop_name")} required minLength={2} className="mt-1.5" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="contact_address">Shop contact address (private)</Label>
          <Input id="contact_address" value={form.contact_address} onChange={update("contact_address")} placeholder="Contact address" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="city">Shop city</Label>
          <Input id="city" value={form.city} onChange={update("city")} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="country">Shop country</Label>
          <Input id="country" value={form.country} onChange={update("country")} className="mt-1.5" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="maker_type">Who makes the goods</Label>
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
        <div className="sm:col-span-2">
          <Label htmlFor="bio">About the shop</Label>
          <Textarea id="bio" value={form.bio} onChange={update("bio")} rows={3} className="mt-1.5" />
        </div>
      </div>

      <div className="mt-8 border-t border-border/60 pt-6">
        <h3 className="font-heading text-xl">Private pickup location</h3>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          This address is stored privately to group sellers sharing a pickup location. It is not shown on public shop pages.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="pickup_address_line1">Pickup address</Label>
            <Input id="pickup_address_line1" value={form.pickup_address_line1} onChange={update("pickup_address_line1")} required className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pickup_address_line2">Unit, suite or additional address details</Label>
            <Input id="pickup_address_line2" value={form.pickup_address_line2} onChange={update("pickup_address_line2")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="pickup_city">Pickup city</Label>
            <Input id="pickup_city" value={form.pickup_city} onChange={update("pickup_city")} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="pickup_region">State or region</Label>
            <Input id="pickup_region" value={form.pickup_region} onChange={update("pickup_region")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="pickup_postcode">Postcode</Label>
            <Input id="pickup_postcode" value={form.pickup_postcode} onChange={update("pickup_postcode")} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="pickup_country">Pickup country</Label>
            <Input id="pickup_country" value={form.pickup_country} onChange={update("pickup_country")} required className="mt-1.5" />
          </div>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="submit" size="lg" className="rounded-full" disabled={busy}>
          {busy ? "Saving…" : initialProfile ? "Save shop details" : "Open my shop"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" size="lg" className="rounded-full" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

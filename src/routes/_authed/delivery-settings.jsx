import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getDeliverySettings, saveDeliverySettings } from "@/lib/delivery-fns";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authed/delivery-settings")({
  head: () => ({ meta: [{ title: "Delivery rates — Sweet Shop" }] }),
  component: DeliverySettingsPage,
});

function DeliverySettingsPage() {
  const { user } = useAuth();
  const load = useServerFn(getDeliverySettings);
  const save = useServerFn(saveDeliverySettings);
  const [baseFee, setBaseFee] = useState("");
  const [additionalFee, setAdditionalFee] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") {
      setLoading(false);
      return;
    }
    load()
      .then(({ settings }) => {
        if (settings) {
          setBaseFee((settings.base_fee_cents / 100).toFixed(2));
          setAdditionalFee((settings.additional_pickup_fee_cents / 100).toFixed(2));
          setEnabled(!!settings.enabled);
        }
      })
      .catch((err) => setError(err?.message || "Could not load delivery settings."))
      .finally(() => setLoading(false));
  }, [user]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const base = Math.round(Number(baseFee) * 100);
    const additional = Math.round(Number(additionalFee) * 100);
    if (!Number.isFinite(base) || base < 0 || !Number.isFinite(additional) || additional < 0) {
      setError("Enter valid non-negative delivery amounts.");
      setSaving(false);
      return;
    }
    try {
      await save({
        data: {
          base_fee_cents: base,
          additional_pickup_fee_cents: additional,
          currency: "USD",
          enabled,
        },
      });
      setMessage("Delivery rate schedule saved.");
    } catch (err) {
      setError(err?.message || "Could not save delivery settings.");
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20">
        <h1 className="font-heading text-3xl">Delivery settings</h1>
        <p className="mt-3 text-sm text-muted-foreground">Administrator access is required.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="mx-auto max-w-3xl px-5 py-20 text-sm text-muted-foreground">Loading delivery settings…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="eyebrow">Marketplace settings</p>
      <h1 className="mt-3 font-heading text-3xl">Delivery rate schedule</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        This page currently supports a configurable schedule: a base amount for the first distinct pickup location and an additional amount for each further location. Sellers at the same pickup address are counted once. No amounts are prefilled; confirm that this formula matches the intended delivery pricing before enabling it.
      </p>

      <form onSubmit={submit} className="sweet-card mt-8 space-y-6 p-6">
        <div>
          <Label htmlFor="base_fee">Base delivery amount (USD)</Label>
          <Input id="base_fee" type="number" inputMode="decimal" min="0" step="0.01" value={baseFee} onChange={(event) => setBaseFee(event.target.value)} required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="additional_fee">Amount for each additional pickup location (USD)</Label>
          <Input id="additional_fee" type="number" inputMode="decimal" min="0" step="0.01" value={additionalFee} onChange={(event) => setAdditionalFee(event.target.value)} required className="mt-1.5" />
        </div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="mt-0.5 h-4 w-4" />
          <span>
            <span className="font-medium">Enable this rate schedule</span>
            <span className="mt-1 block text-xs text-muted-foreground">Checkout remains unavailable until an administrator enables a saved schedule.</span>
          </span>
        </label>
        {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {message && <p className="rounded-xl bg-secondary p-3 text-sm">{message}</p>}
        <Button type="submit" className="rounded-full" disabled={saving}>
          {saving ? "Saving…" : "Save delivery rates"}
        </Button>
      </form>
    </div>
  );
}

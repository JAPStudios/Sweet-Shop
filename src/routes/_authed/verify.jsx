import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useServerFn } from "@tanstack/react-start";
import { reviewProduct } from "@/lib/verification-fns";
import { formatMoney } from "@/lib/format";
import { categoryLabel, MAKER_TYPES, VERIFICATION } from "@/lib/catalog";
import StatusPill from "@/components/site/StatusPill";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authed/verify")({
  head: () => ({ meta: [{ title: "Verification queue — Sweet Shop" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const { user, isLoadingAuth } = useAuth();
  const review = useServerFn(reviewProduct);
  const [products, setProducts] = useState([]);
  const [notes, setNotes] = useState({});
  const [testNotes, setTestNotes] = useState({});
  const [testCompleted, setTestCompleted] = useState({});
  const [legitimacyConfirmed, setLegitimacyConfirmed] = useState({});
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === "admin";

  const load = () => {
    if (!isAdmin) {
      setLoading(false);
      return Promise.resolve();
    }
    setLoading(true);
    setLoadError("");
    return base44.entities.Product.filter({ verification_status: "pending" }, "created_date", 50)
      .then(setProducts)
      .catch((err) => setLoadError(err?.message || "The verification queue could not be loaded."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoadingAuth) load();
  }, [isLoadingAuth, isAdmin]);

  const decide = async (product, decision) => {
    setBusyId(product.id);
    setErrors((current) => ({ ...current, [product.id]: "" }));
    try {
      await review({
        data: {
          product_id: product.id,
          decision,
          test_completed: !!testCompleted[product.id],
          legitimacy_confirmed: !!legitimacyConfirmed[product.id],
          test_notes: testNotes[product.id] ?? "",
          verification_notes: notes[product.id] ?? "",
        },
      });
      setProducts((list) => list.filter((p) => p.id !== product.id));
    } catch (err) {
      setErrors((current) => ({ ...current, [product.id]: err?.message || "Review could not be saved." }));
    } finally {
      setBusyId(null);
    }
  };

  if (isLoadingAuth) return <div className="mx-auto max-w-4xl px-5 py-16 text-sm">Loading…</div>;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-2xl">Verification is handled by pantry reviewers</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Listings remain private until an authorised reviewer completes the legitimacy and testing checks.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <p className="eyebrow">Legitimacy checks</p>
      <h1 className="mt-3 text-3xl">Verification queue</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        A listing stays private until the reviewer confirms its legitimacy, completes the required test and records the evidence. Approval publishes the listing.
      </p>

      {loadError && (
        <div className="mt-6 rounded-xl bg-destructive/10 p-4" role="alert">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button variant="outline" className="mt-3 rounded-full" onClick={load}>Try again</Button>
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading the queue…</p>
      ) : loadError ? null : products.length === 0 ? (
        <div className="sweet-card mt-8 p-10 text-center">
          <p className="font-heading text-xl">The queue is clear</p>
          <p className="mt-2 text-sm text-muted-foreground">No listings are waiting for review.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {products.map((product) => {
            const readyToApprove =
              !!testCompleted[product.id] &&
              !!legitimacyConfirmed[product.id] &&
              (testNotes[product.id] ?? "").trim().length >= 10;
            const readyToReject = (notes[product.id] ?? "").trim().length >= 3;
            return (
              <li key={product.id} className="sweet-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-xl">{product.title}</h2>
                    <p className="text-xs text-muted-foreground">
                      {product.seller_name} · {categoryLabel(product.category)} · {formatMoney(product.price_cents)}
                    </p>
                  </div>
                  <StatusPill status={product.verification_status} map={VERIFICATION} />
                </div>

                <p className="mt-4 text-sm text-foreground/80">{product.description}</p>

                <dl className="mt-4 grid gap-3 rounded-2xl bg-muted/50 p-4 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold uppercase tracking-[0.1em] text-muted-foreground">Provenance</dt>
                    <dd className="mt-1">{product.provenance || "Not supplied"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold uppercase tracking-[0.1em] text-muted-foreground">Maker</dt>
                    <dd className="mt-1">
                      {MAKER_TYPES[product.maker_type] ?? "Independent seller"}
                      {product.maker_name ? ` · ${product.maker_name}` : ""}
                    </dd>
                    <dd className="mt-1">
                      Recorded maker compensation rate per item: {formatMoney(product.maker_compensation_cents || 0)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 space-y-3 rounded-2xl border border-border/70 p-4">
                  <label className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={!!testCompleted[product.id]}
                      onChange={(event) => setTestCompleted((current) => ({ ...current, [product.id]: event.target.checked }))}
                      className="mt-0.5 h-4 w-4"
                    />
                    <span>Product testing completed</span>
                  </label>
                  <label className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={!!legitimacyConfirmed[product.id]}
                      onChange={(event) => setLegitimacyConfirmed((current) => ({ ...current, [product.id]: event.target.checked }))}
                      className="mt-0.5 h-4 w-4"
                    />
                    <span>Product and listing legitimacy confirmed</span>
                  </label>
                  <Textarea
                    value={testNotes[product.id] ?? ""}
                    onChange={(event) => setTestNotes((current) => ({ ...current, [product.id]: event.target.value }))}
                    placeholder="Record the test performed and evidence supporting the legitimacy check."
                    rows={3}
                  />
                  <Textarea
                    value={notes[product.id] ?? ""}
                    onChange={(event) => setNotes((current) => ({ ...current, [product.id]: event.target.value }))}
                    placeholder="Reviewer note for the seller (required when rejecting)."
                    rows={2}
                  />
                </div>

                {errors[product.id] && (
                  <p className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{errors[product.id]}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() => decide(product, "verified")}
                    className="rounded-full"
                    disabled={!readyToApprove || busyId === product.id}
                  >
                    <Check className="mr-1.5 h-4 w-4" /> Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => decide(product, "rejected")}
                    className="rounded-full border-destructive/30 text-destructive"
                    disabled={!readyToReject || busyId === product.id}
                  >
                    <X className="mr-1.5 h-4 w-4" /> Reject
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

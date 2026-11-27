import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Store, Upload, BadgeCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { updateShipmentStatus } from "@/lib/order-fns";
import { submitProductForVerification } from "@/lib/verification-fns";
import ShopSetup from "@/components/seller/ShopSetup";
import SellerListings from "@/components/seller/SellerListings";
import SellerShipments from "@/components/seller/SellerShipments";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/seller/")({
  head: () => ({ meta: [{ title: "Seller dashboard — Sweet Shop" }] }),
  component: SellerDashboard,
});

function SellerDashboard() {
  const { user } = useAuth();
  const markShipment = useServerFn(updateShipmentStatus);
  const submitVerification = useServerFn(submitProductForVerification);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    setLoading(true);
    Promise.all([
      base44.entities.SellerProfile.filter({ created_by_id: user.id }),
      base44.entities.Product.filter({ created_by_id: user.id }, "-created_date", 50),
      base44.entities.Shipment.filter({ seller_id: user.id }, "created_date", 50),
    ])
      .then(([profiles, productPage, shipmentPage]) => {
        if (!active) return;
        setProfile(profiles[0] ?? null);
        setProducts(productPage);
        setShipments(shipmentPage);
        setError("");
      })
      .catch((err) => {
        if (active) setError(err?.message || "The seller dashboard could not be loaded. Reload the page and try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const submitForVerification = async (product) => {
    setBusyId(product.id);
    setError("");
    try {
      await submitVerification({ data: { product_id: product.id } });
      setProducts((list) =>
        list.map((p) => (p.id === product.id ? { ...p, verification_status: "pending" } : p)),
      );
    } catch (err) {
      setError(err?.message || "The listing could not be submitted for verification.");
    } finally {
      setBusyId(null);
    }
  };

  const updateShipment = async (shipment, status) => {
    setBusyId(shipment.id);
    setError("");
    try {
      await markShipment({ data: { shipment_id: shipment.id, status } });
      setShipments((list) => list.map((s) => (s.id === shipment.id ? { ...s, status } : s)));
    } catch (err) {
      setError(err?.message || "The parcel status could not be updated.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-5xl px-5 py-16 text-sm text-muted-foreground">Loading your shop…</div>;
  }

  if (error && !profile && products.length === 0 && shipments.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20">
        <h1 className="text-2xl">Seller dashboard unavailable</h1>
        <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>
        <Button className="mt-5 rounded-full" onClick={() => window.location.reload()}>Reload dashboard</Button>
      </div>
    );
  }

  if (!profile || editingProfile) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-12">
        <p className="eyebrow">Selling</p>
        <h1 className="mt-3 text-3xl">{profile ? "Edit your shop" : "Set up your shop"}</h1>
        {error && <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <ShopSetup
          initialProfile={profile}
          onSaved={(savedProfile) => {
            setProfile(savedProfile);
            setEditingProfile(false);
            setError("");
          }}
          onCancel={profile ? () => setEditingProfile(false) : undefined}
        />
      </div>
    );
  }

  const live = products.filter((p) => p.verification_status === "verified").length;
  const pending = products.filter((p) => p.verification_status === "pending").length;
  const toPack = shipments.filter((s) => s.status === "placed" || s.status === "packing").length;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Seller dashboard</p>
          <h1 className="mt-3 text-3xl">{profile.shop_name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {profile.contact_address || "No contact address yet"} · Union member
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="rounded-full" onClick={() => setEditingProfile(true)}>
            Edit shop
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/seller/import">
              <Upload className="mr-1.5 h-4 w-4" /> Import
            </Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link to="/seller/new">Add a listing</Link>
          </Button>
        </div>
      </div>

      {error && <p role="alert" className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Live listings", value: live, icon: Store },
          { label: "In verification", value: pending, icon: BadgeCheck },
          { label: "Parcels to pack", value: toPack, icon: Upload },
        ].map((stat) => (
          <div key={stat.label} className="sweet-card p-5">
            <stat.icon className="h-4 w-4 text-primary/60" />
            <p className="mt-3 font-heading text-2xl">{stat.value}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-heading text-2xl">Listings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Drafts and rejected listings are private. Submit one for verification to put it on the shelf.
        </p>
        <div className="mt-4">
          <SellerListings products={products} onSubmit={submitForVerification} busyId={busyId} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl">Parcels</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the packing status of each seller parcel here. UnterSous handles pickup and delivery; its connection to this preview is not active.
        </p>
        <div className="mt-4">
          <SellerShipments shipments={shipments} onUpdate={updateShipment} busyId={busyId} />
        </div>
      </section>
    </div>
  );
}

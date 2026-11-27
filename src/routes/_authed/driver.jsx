import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCheck, MapPin, PackageCheck, Truck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { collectShipments, deliverShipment, listPickupBoard } from "@/lib/driver-fns";
import { requestUnterSousPickupRun } from "@/lib/integration-fns";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/driver")({
  head: () => ({ meta: [{ title: "Pickup console — Sweet Shop" }] }),
  component: DriverPage,
});

function DriverPage() {
  const { user, isLoadingAuth } = useAuth();
  const loadBoard = useServerFn(listPickupBoard);
  const collect = useServerFn(collectShipments);
  const deliver = useServerFn(deliverShipment);
  const dispatchRun = useServerFn(requestUnterSousPickupRun);
  const [locations, setLocations] = useState([]);
  const [inTransit, setInTransit] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isStaff = user?.role === "admin" || user?.role === "driver";

  const refresh = async () => {
    const board = await loadBoard();
    setLocations(board.locations);
    setInTransit(board.inTransit);
    setSelected([]);
  };

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isStaff) {
      setLoading(false);
      return;
    }
    refresh()
      .catch((err) => setError(err?.message || "The pickup board could not be loaded."))
      .finally(() => setLoading(false));
  }, [isLoadingAuth, user?.id, user?.role]);

  const toggle = (id) =>
    setSelected((list) => (list.includes(id) ? list.filter((value) => value !== id) : [...list, id]));

  const runCollect = async () => {
    setBusy(true);
    setError("");
    try {
      await collect({ data: { shipment_ids: selected } });
      await refresh();
    } catch (err) {
      setError(err?.message || "The parcels could not be marked as collected.");
    } finally {
      setBusy(false);
    }
  };

  const runDispatch = async () => {
    setBusy(true);
    setError("");
    try {
      await dispatchRun({ data: { stops } });
    } catch (err) {
      setError(err?.message || "The pickup run could not be sent to UnterSous.");
    } finally {
      setBusy(false);
    }
  };

  const runDeliver = async (shipmentId) => {
    setBusy(true);
    setError("");
    try {
      await deliver({ data: { shipment_id: shipmentId } });
      await refresh();
    } catch (err) {
      setError(err?.message || "The parcel could not be marked as delivered.");
    } finally {
      setBusy(false);
    }
  };

  if (isLoadingAuth || loading) {
    return <div className="mx-auto max-w-5xl px-5 py-16 text-sm text-muted-foreground">Loading the pickup board…</div>;
  }

  if (!isStaff) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-2xl">Driver access required</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This console is available to driver accounts and administrators.
        </p>
      </div>
    );
  }

  const totalParcels = locations.reduce((count, location) => count + location.parcels.length, 0);
  const stops = locations
    .map((location) => ({
      pickup_location_key: location.key,
      parcel_count: location.parcels.filter((parcel) => selected.includes(parcel.id)).length,
    }))
    .filter((stop) => stop.parcel_count > 0);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <p className="eyebrow">Pickup console</p>
      <h1 className="mt-3 text-3xl">Collect parcels by pickup location</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Parcels that sellers have marked ready are grouped by the address they are collected from.
        Collect a whole stop in one visit, then mark each parcel delivered.
      </p>

      {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-heading text-2xl">
          <MapPin className="h-4 w-4 text-primary/70" /> Ready to collect
        </h2>
        {totalParcels === 0 ? (
          <div className="sweet-card mt-4 p-8 text-center text-sm text-muted-foreground">
            No parcels are waiting for collection.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {locations.map((location) => (
              <div key={location.key} className="sweet-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-heading text-lg">{location.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {location.parcels.length} {location.parcels.length === 1 ? "parcel" : "parcels"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    disabled={busy}
                    onClick={() =>
                      setSelected((list) => [
                        ...new Set([...list, ...location.parcels.map((parcel) => parcel.id)]),
                      ])
                    }
                  >
                    Select stop
                  </Button>
                </div>
                <ul className="mt-4 divide-y divide-border/60">
                  {location.parcels.map((parcel) => (
                    <li key={parcel.id} className="flex items-start gap-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(parcel.id)}
                        onChange={() => toggle(parcel.id)}
                        className="mt-1 h-4 w-4"
                        aria-label={`Select ${parcel.order_reference}`}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {parcel.seller_name} · {parcel.order_reference}
                        </p>
                        <p className="text-xs text-muted-foreground">{parcel.item_summary}</p>
                        {parcel.pickup_code && (
                          <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">
                            Pickup code {parcel.pickup_code}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 p-4">
              <p className="text-sm text-muted-foreground">
                {selected.length} selected · {locations.length} pickup{" "}
                {locations.length === 1 ? "location" : "locations"}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-full"
                  disabled={stops.length === 0 || busy}
                  onClick={runDispatch}
                >
                  Request UnterSous run
                </Button>
                <Button className="rounded-full" disabled={selected.length === 0 || busy} onClick={runCollect}>
                  <Truck className="mr-1.5 h-4 w-4" /> Mark collected
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 font-heading text-2xl">
          <PackageCheck className="h-4 w-4 text-primary/70" /> Out for delivery
        </h2>
        {inTransit.length === 0 ? (
          <div className="sweet-card mt-4 p-8 text-center text-sm text-muted-foreground">
            No collected parcels are awaiting delivery.
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {inTransit.map((parcel) => (
              <li key={parcel.id} className="sweet-card flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="text-sm font-medium">
                    {parcel.seller_name} · {parcel.order_reference}
                  </p>
                  <p className="text-xs text-muted-foreground">{parcel.item_summary}</p>
                </div>
                <Button className="rounded-full" disabled={busy} onClick={() => runDeliver(parcel.id)}>
                  <CheckCheck className="mr-1.5 h-4 w-4" /> Mark delivered
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Building2, ShieldAlert } from "lucide-react";
import { getOrganisationAccount, revokeWorker } from "@/lib/organisation-fns";
import OrganisationForm from "@/components/organisation/OrganisationForm";
import WorkerForm from "@/components/organisation/WorkerForm";
import WorkerTable from "@/components/organisation/WorkerTable";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/organisation")({
  head: () => ({ meta: [{ title: "Organisation account — Sweet Shop" }] }),
  component: OrganisationPage,
});

function OrganisationPage() {
  const load = useServerFn(getOrganisationAccount);
  const revoke = useServerFn(revokeWorker);
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const refresh = async () => {
    const result = await load();
    setState(result);
    return result;
  };

  useEffect(() => {
    let active = true;
    load()
      .then((result) => {
        if (active) setState(result);
      })
      .catch((err) => {
        if (active) setError(err?.message || "The organisation account could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const removeAccess = async (member) => {
    setBusyId(member.id);
    setError("");
    try {
      await revoke({ data: { member_id: member.id, reason: "Employment ended" } });
      await refresh();
    } catch (err) {
      setError(err?.message || "That worker's access could not be removed.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl px-5 py-16 text-sm text-muted-foreground">Loading the organisation account…</div>;
  }

  if (error && !state) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20">
        <h1 className="text-2xl">Organisation account unavailable</h1>
        <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>
        <Button className="mt-5 rounded-full" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    );
  }

  const organisation = state?.organisation ?? null;
  const canManage = !!state?.canManage;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <p className="eyebrow">Selling</p>
      <h1 className="mt-3 text-3xl">Organisation account</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        A company lists through an organisation account while each employee keeps their own account. Adding a
        worker records the membership; removing access ends it.
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-muted/70 p-4">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          JaMail is not connected, so no worker's identity or employment has been confirmed by JaMail and the
          organisation stays pending verification. Memberships recorded here are enforced by this app: a revoked
          worker can no longer create or edit listings on the organisation's behalf.
        </p>
      </div>

      {error && <p role="alert" className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      {organisation && !editing ? (
        <>
          <section className="sweet-card mt-8 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Building2 className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <div>
                  <h2 className="font-heading text-xl">{organisation.name}</h2>
                  <p className="text-xs text-muted-foreground">{organisation.contact_email || "No contact email"}</p>
                </div>
              </div>
              <span className="rounded-full bg-[hsl(38_92%_88%)] px-3 py-1 text-xs font-semibold text-[hsl(28_45%_28%)]">
                {organisation.status === "active"
                  ? "Verified by JaMail"
                  : organisation.status === "suspended"
                    ? "Suspended"
                    : "Pending JaMail verification"}
              </span>
            </div>

            {canManage && (
              <Button variant="outline" className="mt-6 rounded-full" onClick={() => setEditing(true)}>
                Edit organisation details
              </Button>
            )}
          </section>

          {canManage ? (
            <section className="sweet-card mt-6 p-6 sm:p-8">
              <h2 className="font-heading text-xl">Workers</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {state.members.filter((member) => member.status === "active").length} active{" "}
                {state.members.filter((member) => member.status === "active").length === 1 ? "membership" : "memberships"}
              </p>
              <WorkerForm onAdded={refresh} />
              <WorkerTable members={state.members} onRevoke={removeAccess} busyId={busyId} />
            </section>
          ) : (
            <section className="sweet-card mt-6 p-6 sm:p-8">
              <h2 className="font-heading text-xl">Your membership</h2>
              {state.membership ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  You are recorded as {state.membership.role === "owner" ? "the owner" : "a worker"} of{" "}
                  {organisation.name}. You can list goods on its behalf from the listing form.
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Your membership of this organisation is not active, so you cannot list goods on its behalf.
                </p>
              )}
            </section>
          )}
        </>
      ) : organisation && editing ? (
        <>
          <h2 className="mt-8 font-heading text-xl">Edit organisation details</h2>
          <OrganisationForm
            organisation={organisation}
            onSaved={(saved) => {
              setState((current) => ({ ...current, organisation: saved }));
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        </>
      ) : (
        <>
          <h2 className="mt-8 font-heading text-xl">Create an organisation account</h2>
          {state?.revokedMembership && (
            <p className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              Your access to {state.revokedMembership.organisation_name || "an organisation"} was removed, so you
              cannot list on its behalf. Contact the organisation if that was a mistake.
            </p>
          )}
          <OrganisationForm onSaved={() => refresh()} />
        </>
      )}
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/AuthContext";
import { EXTERNAL_SERVICES } from "@/lib/services";
import { getIntegrationStatus } from "@/lib/integration-fns";
import ServiceStatusCard from "@/components/admin/ServiceStatusCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/integrations")({
  head: () => ({ meta: [{ title: "Connections — Sweet Shop" }] }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const { user, isLoadingAuth } = useAuth();
  const load = useServerFn(getIntegrationStatus);
  const [statuses, setStatuses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    let active = true;
    load()
      .then((result) => {
        if (active) setStatuses(result.statuses);
      })
      .catch((err) => {
        if (active) setError(err?.message || "The connection status could not be read.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isLoadingAuth, isAdmin]);

  if (isLoadingAuth || loading) {
    return <div className="mx-auto max-w-4xl px-5 py-16 text-sm text-muted-foreground">Checking connections…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-2xl">Administrator access required</h1>
        <p className="mt-3 text-sm text-muted-foreground">Connection status is visible to administrators only.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20">
        <h1 className="text-2xl">Connections unavailable</h1>
        <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>
        <Button className="mt-5 rounded-full" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <p className="eyebrow">Connections</p>
      <h1 className="mt-3 text-3xl">What is connected, and what is still needed</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Digital Pantry does not pretend these services are live. Each card lists the credentials and the API
        surface a working connection needs; until they exist, the app keeps to the behaviour described at the
        bottom of the card.
      </p>

      <div className="mt-8 space-y-5">
        {EXTERNAL_SERVICES.map((service) => (
          <ServiceStatusCard key={service.key} service={service} status={statuses?.[service.key]} />
        ))}
      </div>
    </div>
  );
}
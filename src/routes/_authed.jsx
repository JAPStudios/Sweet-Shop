import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGateError, requireSignedIn } from "@/components/auth/AuthGate";
import SiteLayout from "@/components/site/SiteLayout";

export const Route = createFileRoute("/_authed")({
  ssr: false,
  beforeLoad: requireSignedIn,
  errorComponent: AuthGateError,
  component: () => (
    <SiteLayout>
      <Outlet />
    </SiteLayout>
  ),
});
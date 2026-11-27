import { createFileRoute, Link } from "@tanstack/react-router";
import IncomeAccessPanel from "@/components/site/IncomeAccessPanel";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_site/affordability")({
  head: () => ({
    meta: [
      { title: "Affordability — Sweet Shop" },
      {
        name: "description",
        content:
          "Income-sensitive pricing depends on a Butter Bank verification response, which is not connected in this build.",
      },
    ],
  }),
  component: AffordabilityPage,
});

function AffordabilityPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="eyebrow">Affordability</p>
      <h1 className="mt-3 text-3xl sm:text-4xl">Income-sensitive pricing</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        The intended pricing model uses a real Butter Bank verification response. That connection
        is not configured in this build.
      </p>

      <div className="sweet-card mt-8 p-6 sm:p-8">
        <p className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          Not connected in this build
        </p>
        <h2 className="mt-4 font-heading text-xl">Current checkout status</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          No Butter Bank verification can be requested here and no income-based adjustment is
          calculated or applied. The app does not invent income bands, thresholds, percentages or
          eligibility rules.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Orders are not accepted in this preview. Delivery rates and payment routing must be
          configured before checkout can complete.
        </p>
      </div>

      <IncomeAccessPanel />

      <div className="sweet-card mt-6 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading text-lg">Seller-set prices</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Product listings show the prices entered by their sellers. No income-based adjustment
            is applied until Butter Bank is connected.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/browse">Browse the pantry</Link>
        </Button>
      </div>
    </div>
  );
}
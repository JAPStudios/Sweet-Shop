import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Sprout, Route as RouteIcon, HandHeart } from "lucide-react";
import { getUnionStats } from "@/lib/server-fns";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_site/union")({
  loader: () => getUnionStats(),
  head: () => ({
    meta: [
      { title: "The seller union — Sweet Shop" },
      { name: "description", content: "Every account using Digital Pantry is a member of the seller union." },
    ],
  }),
  component: UnionPage,
});

const principles = [
  {
    icon: HandHeart,
    title: "Sellers set their own prices",
    body: "Each seller enters the price for their own listings. The catalogue displays those prices without inventing income discounts.",
  },
  {
    icon: RouteIcon,
    title: "Delivery is buyer-paid",
    body: "UnterSous handles pickup and delivery, including collection across sellers sharing a pickup location. The connection is not active in this preview; checkout is not open yet.",
  },
  {
    icon: Sprout,
    title: "Income-sensitive access",
    body: "The intended pricing adjustment depends on a Butter Bank verification response. That connection is not configured, so no income bands or discounts are assumed.",
  },
];

function UnionPage() {
  const stats = Route.useLoaderData();
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="eyebrow">Membership</p>
      <h1 className="mt-3 max-w-2xl text-4xl leading-tight sm:text-5xl">
        Every user is a union member.
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Every account using Digital Pantry is automatically part of the seller union. Membership
        does not depend on whether the account buys goods, sells goods or handles deliveries.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Union membership", value: "Automatic" },
          { label: "Shops with verified listings", value: stats.sellers },
          { label: "Verified listings", value: stats.listings },
        ].map((stat) => (
          <div key={stat.label} className="sweet-card p-6">
            <p className="font-heading text-3xl">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {principles.map((item) => (
          <div key={item.title} className="sweet-card p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <item.icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <h2 className="mt-5 text-lg">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="sweet-card mt-12 flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <p className="font-heading text-xl">
              {isAuthenticated ? `${user?.full_name || "Account"} · union member` : "Union membership"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isAuthenticated
                ? "Membership is automatic for this account."
                : "Sign in to access Digital Pantry as a union member."}
            </p>
          </div>
        </div>
        <Button asChild className="rounded-full">
          <Link to={isAuthenticated ? "/seller" : "/login"}>
            {isAuthenticated ? "Open your shop" : "Sign in"}
          </Link>
        </Button>
      </div>
    </div>
  );
}

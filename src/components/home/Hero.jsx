import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Route, Tag } from "lucide-react";

const trust = [
  { icon: BadgeCheck, label: "Tested and verified before publication" },
  { icon: Tag, label: "Prices set by sellers" },
  { icon: Route, label: "Consolidated pickup across sellers" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-12 md:grid-cols-[1.05fr_0.95fr] md:items-center md:pt-20">
        <div>
          <p className="eyebrow">A seller-union marketplace</p>
          <h1 className="mt-5 text-4xl leading-[1.03] sm:text-5xl md:text-[3.9rem]">
            A pantry that <span className="italic text-primary">runs on sweetness.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Essential goods from independent makers and workshops, at the prices they set. Every
            listing stays private until a reviewer confirms its legitimacy and records completed
            testing. Every account using Digital Pantry is a union member.
          </p>
          <div className="mt-8 rounded-2xl border border-primary/20 bg-white/70 px-4 py-3 text-sm">
            <span className="font-semibold">Preview:</span> browsing and seller setup are available.
            Checkout is not accepting orders while payment routing is configured.
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/browse">Browse the pantry</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-primary/25 bg-white/60">
              <Link to="/affordability">How affordability works</Link>
            </Button>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
            {trust.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-foreground/70">
                <Icon className="h-4 w-4 text-primary/70" strokeWidth={1.8} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-6 h-24 w-24 rounded-full bg-[hsl(154_52%_86%)] blur-2xl" />
          <div className="absolute -right-4 bottom-0 h-32 w-32 rounded-full bg-[hsl(276_62%_90%)] blur-2xl" />
          <div className="sweet-card relative overflow-hidden p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
              Affordability
            </p>
            <p className="mt-2 font-heading text-2xl">Income-sensitive pricing</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The intended pricing model uses a verified income assessment from Butter Bank. That
              connection is not configured in this build, so no income-based adjustment is applied.
            </p>
            <div className="mt-5 rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-sm font-semibold">Current pricing status</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Product pages show seller-entered prices. Orders cannot be placed in this preview.
              </p>
            </div>
            <Link
              to="/affordability"
              className="mt-5 inline-block text-xs font-medium text-primary/80 hover:text-primary"
            >
              Read how affordability works →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
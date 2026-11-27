import { BadgeCheck, PackageCheck, Sparkles, Tag } from "lucide-react";

const steps = [
  {
    icon: Tag,
    title: "Prices set by sellers",
    body: "Every listing shows the maker's own price. A reviewer confirms legitimacy and records product testing before publication.",
  },
  {
    icon: PackageCheck,
    title: "Review the basket",
    body: "The basket shows seller-entered prices and, once configured, a delivery quote based on distinct pickup locations. Order submission remains closed until payment routing is connected.",
  },
  {
    icon: Sparkles,
    title: "UnterSous collects and delivers",
    body: "Sellers package their own goods. UnterSous handles pickup and delivery, collecting parcels from multiple sellers and grouping sellers that share a pickup location. The UnterSous connection is not active in this preview.",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">How the pantry works</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">Low cost, honestly handled</h2>
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <BadgeCheck className="h-4 w-4 text-primary/70" strokeWidth={1.8} />
          Nothing appears on the shelf until it has been verified
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="sweet-card p-7">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <step.icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span className="font-heading text-3xl text-primary/25">0{index + 1}</span>
            </div>
            <h3 className="mt-6 text-xl">{step.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
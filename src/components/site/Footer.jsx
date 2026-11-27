import { Link } from "@tanstack/react-router";

const columns = [
  {
    title: "Pantry",
    links: [
      { label: "Browse goods", to: "/browse" },
      { label: "Seller union", to: "/union" },
      { label: "Affordability", to: "/affordability" },
    ],
  },
  {
    title: "Sellers",
    links: [
      { label: "Seller dashboard", to: "/seller" },
      { label: "Organisation accounts", to: "/organisation" },
      { label: "Verification", to: "/verify" },
      { label: "Import listings", to: "/seller/import" },
    ],
  },
  {
    title: "Access",
    links: [
      { label: "Your orders", to: "/orders" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-white/50">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="font-heading text-2xl">Sweet Shop</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
              Digital Pantry
            </p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A marketplace for essential goods and other seller-listed products. Sellers can
              list without a Digital Pantry listing fee; delivery is buyer-paid and prices are seller-set.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/60">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-muted-foreground transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 h-px w-full pastel-rule opacity-70" />
        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Butter Bank affordability, JaMail sign-in, direct external-store imports, UnterSous pickup
          and delivery and payment collection are not connected. Seller listing, manual product
          testing and legitimacy review, basket and delivery quoting are present in the preview.
          Orders are not accepted until the required connections, delivery rates, payment collection
          and seller payouts are configured.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">Every user of Digital Pantry is a union member.</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Sweet Shop: Digital Pantry operates under Sweet Shop: Survival Service, which is owned by the
          not-for-profit organisation HeLLP.
        </p>
      </div>
    </footer>
  );
}
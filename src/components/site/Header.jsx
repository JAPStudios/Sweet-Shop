import { Link } from "@tanstack/react-router";
import { ShoppingBasket, UserRound } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/hooks/useCart";

const links = [
  { label: "Browse", to: "/browse" },
  { label: "Union", to: "/union" },
  { label: "Affordability", to: "/affordability" },
  { label: "Organisations", to: "/organisation" },
  { label: "Sell", to: "/seller" },
];

export default function Header() {
  const { isAuthenticated, isLoadingAuth, user, navigateToLogin, logout } = useAuth();
  const { count } = useCart();
  const staffLinks = [
    ...(user?.role === "admin" ? [{ label: "Verify", to: "/verify" }] : []),
    ...(user?.role === "admin" || user?.role === "driver" ? [{ label: "Pickups", to: "/driver" }] : []),
    ...(user?.role === "admin" ? [{ label: "Delivery rates", to: "/delivery-settings" }] : []),
    ...(user?.role === "admin" ? [{ label: "Connections", to: "/integrations" }] : []),
  ];
  const visibleLinks = [...links, ...staffLinks];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link to="/" className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-[1rem] bg-primary text-primary-foreground">
            <span className="font-heading text-lg leading-none">S</span>
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[hsl(38_92%_72%)] ring-2 ring-background" />
          </span>
          <span className="leading-tight">
            <span className="block font-heading text-lg">Sweet Shop</span>
            <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-primary/70">
              Digital Pantry
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full px-3.5 py-2 text-sm text-foreground/70 transition-colors hover:bg-white/70 hover:text-foreground"
              activeProps={{ className: "bg-white/80 text-foreground" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-full border border-border/80 bg-white/70 px-3.5 py-2 text-sm font-medium transition-colors hover:bg-white"
          >
            <ShoppingBasket className="h-4 w-4" strokeWidth={1.8} />
            <span className="hidden sm:inline">Basket</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] font-semibold text-primary-foreground">
              {count}
            </span>
          </Link>

          {isLoadingAuth ? (
            <span className="h-9 w-20 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-1">
              <Link
                to="/orders"
                className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-foreground/70 transition-colors hover:text-foreground sm:flex"
              >
                <UserRound className="h-4 w-4" strokeWidth={1.8} />
                {user?.full_name?.split(" ")[0] || "Account"}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={navigateToLogin}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {visibleLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-foreground/65"
            activeProps={{ className: "bg-white/80 text-foreground" }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
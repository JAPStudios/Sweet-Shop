import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { listMarketplace } from "@/lib/server-fns";
import ProductCard from "@/components/site/ProductCard";
import { CATEGORIES, categoryLabel } from "@/lib/catalog";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_site/browse")({
  validateSearch: (search) => ({
    category: typeof search.category === "string" ? search.category : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  loaderDeps: ({ search }) => ({ category: search.category, q: search.q }),
  loader: ({ deps }) => listMarketplace({ data: { category: deps.category, q: deps.q } }),
  head: () => ({
    meta: [
      { title: "Browse the pantry — Sweet Shop" },
      { name: "description", content: "Verified goods from union sellers, at the prices they set." },
    ],
  }),
  component: BrowsePage,
});

function BrowsePage() {
  const { products, categories = [] } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [term, setTerm] = useState(search.q ?? "");

  const submit = (event) => {
    event.preventDefault();
    navigate({ to: "/browse", search: { ...search, q: term.trim() || undefined } });
  };

  const active = search.category ? categoryLabel(search.category) : null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="eyebrow">The pantry shelf</p>
      <h1 className="mt-3 text-3xl sm:text-4xl">
        {active || "Everything on the shelf"}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Only verified listings appear here. Each price is the seller's own and delivery is shown at
        checkout.
      </p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search goods, makers or shops"
            className="h-11 rounded-full border-border/80 bg-white/80 pl-11"
            aria-label="Search the pantry"
          />
        </div>
        <button
          type="submit"
          className="h-11 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
        >
          Search
        </button>
      </form>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          to="/browse"
          search={{ ...search, category: undefined }}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
            !search.category
              ? "bg-primary text-primary-foreground"
              : "border border-border/80 bg-white/70 text-foreground/75"
          }`}
        >
          Everything
        </Link>
        {[...new Set([...CATEGORIES.map((category) => category.value), ...categories])].map((categoryValue) => (
          <Link
            key={categoryValue}
            to="/browse"
            search={{ ...search, category: categoryValue }}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
              search.category === categoryValue
                ? "bg-primary text-primary-foreground"
                : "border border-border/80 bg-white/70 text-foreground/75"
            }`}
          >
            {categoryLabel(categoryValue)}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="sweet-card mt-10 p-12 text-center">
          <p className="font-heading text-2xl">Nothing on this shelf yet</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            No verified listings match that search. Sellers are adding goods all the time — try a
            different word or browse another category.
          </p>
          <Link
            to="/browse"
            search={{}}
            className="mt-6 inline-flex rounded-full border border-primary/25 px-5 py-2 text-sm font-medium text-primary"
          >
            Clear filters
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-8 text-xs text-muted-foreground">
            {products.length} verified {products.length === 1 ? "listing" : "listings"}
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
                <Link
                  to="/product/$productId"
                  params={{ productId: product.id }}
                  className="mt-3 block text-center text-xs font-medium text-primary/80 hover:text-primary"
                >
                  View listing details
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
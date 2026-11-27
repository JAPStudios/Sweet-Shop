import { Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/catalog";

export default function CategoryStrip() {
  return (
    <section className="mx-auto max-w-6xl px-5">
      <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          to="/browse"
          className="whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Everything
        </Link>
        {CATEGORIES.map((category) => (
          <Link
            key={category.value}
            to="/browse"
            search={{ category: category.value }}
            className="whitespace-nowrap rounded-full border border-border/80 bg-white/70 px-4 py-2 text-sm text-foreground/75 transition-colors hover:border-primary/30 hover:text-foreground"
          >
            {category.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
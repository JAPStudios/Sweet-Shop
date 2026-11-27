import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { listMarketplace } from "@/lib/server-fns";
import Hero from "@/components/home/Hero";
import CategoryStrip from "@/components/home/CategoryStrip";
import HowItWorks from "@/components/home/HowItWorks";
import MakerBands from "@/components/home/MakerBands";
import ProductCard from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";

const BAND_IMAGES = [
  "https://media.base44.com/images/public/6b049c526feb14dc66c390c7/452951e31203951d46eb5731e054feaf_generated_image.png",
  "https://media.base44.com/images/public/6b049c526feb14dc66c390c7/01ed84d2019534171ce0f3fea42f816c_generated_image.png",
];

export const Route = createFileRoute("/_site/")({
  loader: () => listMarketplace({ data: {} }),
  head: () => ({
    meta: [
      { title: "Sweet Shop: Digital Pantry — essential goods, fairly priced" },
      {
        name: "description",
        content:
          "An open marketplace: verified goods from makers at their listed prices, with delivery consolidated across sellers.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { products } = Route.useLoaderData();
  const shelf = products.slice(0, 3);

  return (
    <div>
      <Hero />
      <CategoryStrip />

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">On the shelf</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Checked before it's sold</h2>
          </div>
          <Button asChild variant="ghost" className="rounded-full text-primary">
            <Link to="/browse">
              See everything <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {shelf.length === 0 ? (
          <div className="sweet-card mt-8 p-10 text-center">
            <p className="font-heading text-xl">The shelf is being stocked</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Verified listings appear here as soon as reviewers approve them.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shelf.map((product) => (
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
        )}
      </section>

      <HowItWorks />
      <MakerBands images={BAND_IMAGES} />

      <section className="mx-auto max-w-6xl px-5 pb-6 pt-14">
        <div className="sweet-card flex flex-col items-start gap-6 p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow">Affordability</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">
              Income-sensitive pricing, once it can be verified.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Lower prices for lower-income households depend on an actual Butter Bank verification
              response. That connection is not part of this build, so every order is charged at the
              seller's listed price plus the delivery charge.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full">
            <Link to="/affordability">How affordability works</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
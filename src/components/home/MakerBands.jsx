import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";

const bands = [
  {
    eyebrow: "On demand · Paid labour",
    title: "Handcrafted by incarcerated makers",
    body: "Goods made inside are commissioned on demand. Each listing records the maker's compensation rate; this build does not yet transfer compensation. Nothing is made without the maker's consent to sell it.",
    note: "Lead times are longer because the maker sets the pace.",
    tone: "from-[hsl(276_62%_93%)] to-[hsl(38_96%_93%)]",
  },
];

export default function MakerBands({ images = [] }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-4 pt-6">
      <div className="grid gap-5 md:grid-cols-2">
        {bands.map((band, index) => (
          <article key={band.title} className="sweet-card overflow-hidden">
            <div className={`relative aspect-[16/10] bg-gradient-to-br ${band.tone}`}>
              {images[index] ? (
                <Image src={images[index]} alt={band.title} className="h-full w-full" fittingType="fill" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="font-heading text-6xl text-primary/20">✽</span>
                </div>
              )}
            </div>
            <div className="p-7">
              <p className="eyebrow">{band.eyebrow}</p>
              <h3 className="mt-3 text-2xl leading-snug">{band.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{band.body}</p>
              <p className="mt-5 flex items-center gap-1.5 text-xs font-medium text-primary">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {band.note}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
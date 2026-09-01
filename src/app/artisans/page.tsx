import type { Metadata } from "next";
import Link from "next/link";
import { Star, MapPin, BadgeCheck, Award } from "lucide-react";
import { getArtisans, getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Our Artisans | FuBao",
  description:
    "Meet the certified Taoist artisans behind every FuBao talisman. Hand-drawn brushwork, traditional cinnabar ink, and decades of lineage practice.",
};

export default async function ArtisansPage() {
  const [artisans, products] = await Promise.all([getArtisans(), getProducts()]);

  const nameBySlug = new Map(products.map((p) => [p.slug, p.name]));

  return (
    <div className="bg-paper">
      {/* Hero */}
      <section className="border-b border-gold/20">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-24">
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-cinnabar">
            The Hands Behind the Ink
          </p>
          <h1 className="mt-5 font-serif text-4xl font-light text-ink sm:text-5xl">
            Our Artisans
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-base leading-relaxed text-smoke">
            Every FuBao talisman is drawn by hand by a certified practitioner.
            Each artisan below is a registered vendor on our marketplace —
            vetted for lineage, brushwork, and ritual training before their
            first piece ever ships.
          </p>
        </div>
      </section>

      {/* Artisan cards */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {artisans.map((artisan) => {
            const isGold = artisan.certification === "gold";
            return (
              <article
                key={artisan.id}
                className="group flex flex-col border border-ink/10 bg-jade/60 p-8 transition-all duration-500 hover:border-gold/40 hover:bg-jade"
              >
                {/* Header: name + certification */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-medium text-ink">
                      {artisan.name}
                    </h2>
                    <p className="mt-2 flex items-center gap-1.5 font-sans text-sm text-smoke">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {artisan.city ? `${artisan.city}, ` : ""}
                      {artisan.country}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-sans text-xs uppercase tracking-widest ${
                      isGold
                        ? "border-gold/50 text-gold"
                        : "border-cinnabar/30 text-cinnabar"
                    }`}
                  >
                    {isGold ? (
                      <Award className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {isGold ? "Gold Certified" : "Certified"}
                  </span>
                </div>

                {/* Bio */}
                <p className="mt-6 flex-1 font-sans text-sm leading-relaxed text-ink/80">
                  {artisan.description}
                </p>

                {/* Specialties */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {artisan.specialties.map((s) => (
                    <span
                      key={s}
                      className="border border-ink/10 bg-paper px-3 py-1 font-sans text-xs text-smoke"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Stats + products */}
                <div className="mt-8 border-t border-ink/10 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-sans text-sm text-ink">
                      <Star
                        className="h-4 w-4 fill-gold text-gold"
                        aria-hidden
                      />
                      {artisan.rating.toFixed(1)} rating
                    </span>
                    <span className="font-sans text-sm text-smoke">
                      {artisan.productCount}{" "}
                      {artisan.productCount === 1 ? "talisman" : "talismans"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    {artisan.productSlugs.map((slug) => (
                      <Link
                        key={slug}
                        href={`/talisman/${slug}`}
                        className="font-sans text-sm text-cinnabar underline-offset-4 transition-colors hover:text-ink hover:underline"
                      >
                        {nameBySlug.get(slug) ?? slug}
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Compliance footer note */}
        <p className="mx-auto mt-16 max-w-2xl text-center font-sans text-xs leading-relaxed text-smoke">
          Artisan certifications attest to traditional training and craft
          quality only. FuBao talismans are cultural artifacts and decorative
          art — for entertainment purposes only.
        </p>
      </section>
    </div>
  );
}

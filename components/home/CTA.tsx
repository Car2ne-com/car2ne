import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getTranslations } from "@/lib/i18n";

export default async function CTA() {
  const { dict } = await getTranslations();
  const t = dict.home.cta;

  return (
    <section className="bg-gradient-to-r from-primary to-primary/85 py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">

        <h2 className="text-5xl font-bold text-primary-foreground">
          {t.title}
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-xl text-primary-foreground/80">
          {t.subtitle}
        </p>

        <div className="mt-10 flex justify-center gap-4">

          <Link
            href="/events"
            className="rounded-xl bg-background px-8 py-4 font-semibold text-primary transition hover:scale-105"
          >
            {t.searchRide}
          </Link>

          <Link
            href="/offer-ride"
            className="flex items-center gap-2 rounded-xl border border-primary-foreground px-8 py-4 font-semibold text-primary-foreground transition hover:bg-primary-foreground/10"
          >
            {t.offerRide}
            <ArrowRight size={18} />
          </Link>

        </div>

      </div>
    </section>
  );
}

import { ShieldCheck, Wallet, Users, MapPinned } from "lucide-react";

import { getTranslations } from "@/lib/i18n";

const featureIcons = [Wallet, Users, MapPinned, ShieldCheck];

export default async function Features() {
  const { dict } = await getTranslations();
  const t = dict.home.features;

  return (
    <section className="bg-background py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display text-[2rem] font-medium leading-[1.08] tracking-[-0.02em] text-foreground md:text-5xl">
            {t.title}
          </h2>

          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {t.description}
          </p>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2">
          {t.items.map((feature, index) => {
            const Icon = featureIcons[index];

            return (
              <li
                key={feature.title}
                className="rounded-3xl border border-border bg-card p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-pop"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-bold text-foreground">
                  {feature.title}
                </h3>

                <p className="mt-2 leading-7 text-muted-foreground">
                  {feature.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

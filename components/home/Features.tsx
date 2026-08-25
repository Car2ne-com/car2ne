import { ShieldCheck, Wallet, Users, MapPinned } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getTranslations } from "@/lib/i18n";

const featureIcons = [Wallet, Users, MapPinned, ShieldCheck];

export default async function Features() {
  const { dict } = await getTranslations();
  const t = dict.home.features;

  return (
    <section className="bg-background py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">

        <div>

          <span className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            {t.badge}
          </span>

          <h2 className="mt-6 text-5xl font-bold text-foreground">
            {t.title}
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {t.description}
          </p>

        </div>

        <div className="grid gap-6">

          {t.items.map((feature, index) => {
            const Icon = featureIcons[index];

            return (
              <Card
                key={feature.title}
                className="flex gap-5 rounded-2xl p-6 shadow-none transition hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent">
                  <Icon className="h-7 w-7 text-accent-foreground" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}

        </div>

      </div>
    </section>
  );
}

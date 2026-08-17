import { ShieldCheck, Wallet, Users, MapPinned } from "lucide-react";

import { getTranslations } from "@/lib/i18n";

const featureIcons = [Wallet, Users, MapPinned, ShieldCheck];

export default async function Features() {
  const { dict } = await getTranslations();
  const t = dict.home.features;

  return (
    <section className="bg-white py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">

        <div>

          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            {t.badge}
          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">
            {t.title}
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-500">
            {t.description}
          </p>

        </div>

        <div className="grid gap-6">

          {t.items.map((feature, index) => {
            const Icon = featureIcons[index];

            return (
              <div
                key={feature.title}
                className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">
                  <Icon className="h-7 w-7 text-emerald-600" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
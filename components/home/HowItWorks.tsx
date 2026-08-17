import { Search, CarFront, PartyPopper } from "lucide-react";

import { getTranslations } from "@/lib/i18n";

const stepIcons = [Search, CarFront, PartyPopper];

export default async function HowItWorks() {
  const { dict } = await getTranslations();
  const t = dict.home.howItWorks;

  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-16 text-center">
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            {t.badge}
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900">
            {t.title}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
            {t.subtitle}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {t.steps.map((step, index) => {
            const Icon = stepIcons[index];

            return (
              <div
                key={step.title}
                className="rounded-3xl bg-white p-10 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                  <Icon className="h-8 w-8 text-emerald-600" />
                </div>

                <h3 className="mb-3 text-2xl font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="leading-7 text-slate-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
import { Search, CarFront, PartyPopper } from "lucide-react";

import { getTranslations } from "@/lib/i18n";

const stepIcons = [Search, CarFront, PartyPopper];

export default async function HowItWorks() {
  const { dict } = await getTranslations();
  const t = dict.home.howItWorks;

  return (
    <section className="border-y border-border bg-secondary/30 py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-20 max-w-xl">
          <h2 className="mt-6 font-display text-4xl font-medium tracking-[-0.02em] text-foreground md:text-[2.75rem]">
            {t.title}
          </h2>

          <p className="text-lg leading-8 text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        {/* Le tappe come fermate lungo una linea sottile */}
        <ol className="relative">
          <div
            aria-hidden
            className="absolute top-3 bottom-3 left-[11px] w-px bg-border md:left-1/2"
          />

          {t.steps.map((step, index) => {
            const Icon = stepIcons[index];
            const flip = index % 2 === 1;

            return (
              <li
                key={step.title}
                className={`relative flex items-start gap-8 pb-16 last:pb-0 md:gap-0 ${
                  flip ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Fermata */}
                <div className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-background md:absolute md:left-1/2 md:-translate-x-1/2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                </div>

                {/* Contenuto, in alternanza sui due lati */}
                <div className="md:w-[calc(50%-2.75rem)]">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-sm font-semibold text-primary">
                      0{index + 1}
                    </span>
                    <span className="h-px flex-1 bg-border" />
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <h3 className="text-xl font-bold text-foreground">
                    {step.title}
                  </h3>

                  <p className="mt-2 leading-7 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

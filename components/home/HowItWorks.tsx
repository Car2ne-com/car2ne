import { Search, CarFront, PartyPopper } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Trova un evento",
    description:
      "Cerca concerti, festival, fiere e qualsiasi evento disponibile.",
  },
  {
    icon: CarFront,
    title: "Trova un passaggio",
    description:
      "Visualizza i passaggi disponibili e scegli quello più adatto a te.",
  },
  {
    icon: PartyPopper,
    title: "Parti insieme",
    description:
      "Condividi il viaggio, risparmia e conosci nuove persone.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-16 text-center">
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            Come funziona
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900">
            Bastano 3 semplici passaggi
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
            Car2ne rende semplice trovare persone che stanno andando
            al tuo stesso evento.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

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
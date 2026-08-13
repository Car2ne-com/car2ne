import { ShieldCheck, Wallet, Users, MapPinned } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Risparmia sul viaggio",
    description:
      "Dividi le spese di carburante e pedaggi con chi va al tuo stesso evento.",
  },
  {
    icon: Users,
    title: "Conosci nuove persone",
    description:
      "Viaggia con persone che condividono le tue stesse passioni.",
  },
  {
    icon: MapPinned,
    title: "Eventi ovunque",
    description:
      "Concerti, festival, fiere, sport e molto altro in tutta Italia.",
  },
  {
    icon: ShieldCheck,
    title: "Community sicura",
    description:
      "Profili verificati e recensioni per viaggiare in tranquillità.",
  },
];

export default function Features() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">

        <div>

          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            Perché Car2ne
          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">
            Il modo più semplice per raggiungere il tuo evento.
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-500">
            Car2ne mette in contatto persone che stanno andando allo stesso
            evento per condividere il viaggio, risparmiare e divertirsi insieme.
          </p>

        </div>

        <div className="grid gap-6">

          {features.map((feature) => {
            const Icon = feature.icon;

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
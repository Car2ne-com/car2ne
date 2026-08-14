import { MapPin } from "lucide-react";

import type { City } from "@/types/city";

type Props = {
  city: City;
  eventCount: number;
};

export default function CityHero({ city, eventCount }: Props) {
  return (
    <section className="mb-16">
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
        <MapPin className="h-4 w-4" />
        Città
      </span>

      <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-900 md:text-6xl">
        Eventi a {city.name}
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
        {eventCount > 0
          ? `${eventCount} ${eventCount === 1 ? "evento in programma" : "eventi in programma"} a ${city.name}. Trova un passaggio o condividi il viaggio con altri partecipanti.`
          : `Nessun evento in programma al momento a ${city.name}.`}
      </p>
    </section>
  );
}

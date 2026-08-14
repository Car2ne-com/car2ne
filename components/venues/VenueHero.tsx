import Link from "next/link";
import { MapPin, Building2 } from "lucide-react";

import type { City } from "@/types/city";
import type { Venue } from "@/types/venue";

type Props = {
  city: City;
  venue: Venue;
  eventCount: number;
};

export default function VenueHero({ city, venue, eventCount }: Props) {
  return (
    <section className="mb-16">
      <Link
        href={`/citta/${city.slug}`}
        className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700"
      >
        <MapPin className="h-4 w-4" />
        {city.name}
      </Link>

      <h1 className="mt-6 flex items-center gap-3 text-5xl font-black tracking-tight text-slate-900 md:text-6xl">
        <Building2 className="h-10 w-10 text-emerald-600" />
        {venue.name}
      </h1>

      {venue.address && (
        <p className="mt-4 text-lg text-slate-500">{venue.address}</p>
      )}

      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
        {eventCount > 0
          ? `${eventCount} ${eventCount === 1 ? "evento in programma" : "eventi in programma"} al ${venue.name}.`
          : `Nessun evento in programma al momento al ${venue.name}.`}
      </p>
    </section>
  );
}

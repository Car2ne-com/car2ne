import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";

import type { City } from "@/types/city";

type Props = {
  city: City;
  eventCount: number;
};

export default function CityCard({ city, eventCount }: Props) {
  return (
    <Link
      href={`/citta/${city.slug}`}
      className="group flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <MapPin className="h-6 w-6" />
        </span>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {city.name}
          </h2>

          <p className="text-sm text-slate-500">
            {eventCount > 0
              ? `${eventCount} ${eventCount === 1 ? "evento" : "eventi"} in programma`
              : "Nessun evento in programma"}
          </p>
        </div>
      </div>

      <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-500" />
    </Link>
  );
}

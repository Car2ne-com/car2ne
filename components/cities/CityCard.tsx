import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";

import type { City } from "@/types/city";

type CardDict = {
  eventsSingular: string;
  eventsPlural: string;
  noEvents: string;
};

type Props = {
  city: City;
  eventCount: number;
  dict: CardDict;
};

export default function CityCard({ city, eventCount, dict }: Props) {
  return (
    <Link
      href={`/citta/${city.slug}`}
      className="group flex items-center justify-between rounded-3xl border border-border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <MapPin className="h-6 w-6" />
        </span>

        <div>
          <h2 className="text-lg font-bold text-foreground">
            {city.name}
          </h2>

          <p className="text-sm text-muted-foreground">
            {eventCount > 0
              ? (eventCount === 1 ? dict.eventsSingular : dict.eventsPlural).replace(
                  "{count}",
                  String(eventCount)
                )
              : dict.noEvents}
          </p>
        </div>
      </div>

      <ChevronRight className="h-5 w-5 text-muted-foreground/60 transition group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}

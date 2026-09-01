import Link from "next/link";
import { MapPin, Building2 } from "lucide-react";

import type { City } from "@/types/city";
import type { Venue } from "@/types/venue";

type VenueHeroDict = {
  withEventsSingular: string;
  withEventsPlural: string;
  noEvents: string;
};

type Props = {
  city: City;
  venue: Venue;
  eventCount: number;
  dict: VenueHeroDict;
};

export default function VenueHero({ city, venue, eventCount, dict }: Props) {
  const description =
    eventCount > 0
      ? (eventCount === 1 ? dict.withEventsSingular : dict.withEventsPlural)
          .replace("{count}", String(eventCount))
          .replace("{venue}", venue.name)
      : dict.noEvents.replace("{venue}", venue.name);

  return (
    <section className="mb-16">
      <Link
        href={`/citta/${city.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <MapPin className="h-4 w-4" />
        {city.name}
      </Link>

      <h1 className="flex items-center gap-3 text-[2.5rem] leading-[1.05] font-medium tracking-tight text-foreground sm:text-5xl md:text-6xl">
        <Building2 className="h-10 w-10 text-primary" />
        {venue.name}
      </h1>

      {venue.address && (
        <p className="mt-4 text-lg text-muted-foreground">{venue.address}</p>
      )}

      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
        {description}
      </p>
    </section>
  );
}

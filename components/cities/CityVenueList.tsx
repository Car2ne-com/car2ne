import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { City } from "@/types/city";
import type { Venue } from "@/types/venue";

type VenueListDict = {
  title: string;
};

type Props = {
  city: City;
  venues: Venue[];
  dict: VenueListDict;
};

export default function CityVenueList({ city, venues, dict }: Props) {
  if (venues.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-foreground">
        {dict.title.replace("{city}", city.name)}
      </h2>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {venues.map((venue) => (
          <Card
            key={venue.id}
            className="relative flex items-center justify-between rounded-2xl px-5 py-4 shadow-none transition hover:border-primary/30 hover:bg-accent"
          >
            <Link
              href={`/citta/${city.slug}/venue/${venue.slug}`}
              aria-label={venue.name}
              className="absolute inset-0 z-10"
            />

            <span className="flex items-center gap-3 font-semibold text-foreground/90">
              <Building2 className="h-4 w-4 text-primary" />
              {venue.name}
            </span>

            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Card>
        ))}
      </div>
    </section>
  );
}

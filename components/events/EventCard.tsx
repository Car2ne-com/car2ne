import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  Car,
  MapPin,
  Music2,
} from "lucide-react";

import { Card } from "@/components/ui/card";

import { Event } from "@/types/event";
import type { Locale } from "@/lib/i18n/locales";

type CardDict = {
  ridesSingular: string;
  ridesPlural: string;
  viewEvent: string;
};

type Props = {
  event: Event;
  locale: Locale;
  dict: CardDict;
};

export default function EventCard({ event, locale, dict }: Props) {
  const formattedDate = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "it-IT", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(event.event_date));

  return (
    <Card
      className="
        group
        relative
        overflow-hidden
        shadow-lg
        transition
        duration-300
        hover:-translate-y-2
        hover:border-primary/30
        hover:shadow-2xl
      "
    >
      {/*
        Link "stretched" che copre l'intera card: permette di
        cliccare ovunque per aprire l'evento, senza annidare <a>
        dentro i link reali di città/venue qui sotto (che stanno
        sopra grazie a z-20 sul loro wrapper).
      */}
      <Link
        href={`/events/${event.slug}`}
        aria-label={event.title}
        className="absolute inset-0 z-10"
      />

      <div className="relative aspect-[16/10] overflow-hidden">
        {event.image_url ? (
          <>
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="
                object-cover
                transition-transform
                duration-500
                group-hover:scale-105
              "
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/70">
            <Music2 className="h-12 w-12 text-primary-foreground" />
          </div>
        )}

        {!!event.ride_count && (
          <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-sm font-semibold text-primary">
            <Car className="h-4 w-4" />
            {event.ride_count}{" "}
            {event.ride_count === 1
              ? dict.ridesSingular
              : dict.ridesPlural}
          </div>
        )}
      </div>

      <div className="space-y-6 p-6">
        <div>
          <h3 className="line-clamp-2 text-xl font-bold text-foreground">
            {event.title}
          </h3>

          <p className="mt-1 text-sm font-medium text-primary">
            {event.artist}
          </p>

          {event.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {event.description}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />

            <span className="relative z-20">
              {event.cities ? (
                <Link
                  href={`/citta/${event.cities.slug}`}
                  className="hover:text-primary hover:underline"
                >
                  {event.city}
                </Link>
              ) : (
                event.city
              )}
              {" · "}
              {event.cities && event.venues ? (
                <Link
                  href={`/citta/${event.cities.slug}/venue/${event.venues.slug}`}
                  className="hover:text-primary hover:underline"
                >
                  {event.venue}
                </Link>
              ) : (
                event.venue
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />

            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex justify-end">
          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              bg-accent
              px-4
              py-2
              text-sm
              font-semibold
              text-accent-foreground
              transition-[gap,background-color]
              duration-300
              group-hover:gap-3
              group-hover:bg-primary/15
            "
          >
            <span>{dict.viewEvent}</span>

            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Card>
  );
}
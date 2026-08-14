import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  Car,
  MapPin,
  Music2,
} from "lucide-react";

import { Event } from "@/types/event";

type Props = {
  event: Event;
};

export default function EventCard({ event }: Props) {
  const formattedDate = new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(event.event_date));

  return (
    <Link
      href={`/events/${event.slug}`}
      className="
        group
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-lg
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-emerald-200
        hover:shadow-2xl
      "
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {event.image_url ? (
          <>
            <Image
              src={event.image_url}
              alt={event.title}
              fill
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
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-500 via-emerald-400 to-emerald-300">
            <Music2 className="h-12 w-12 text-white" />
          </div>
        )}

        {!!event.ride_count && (
          <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-emerald-700 backdrop-blur">
            <Car className="h-4 w-4" />
            {event.ride_count}{" "}
            {event.ride_count === 1
              ? "passaggio"
              : "passaggi"}
          </div>
        )}
      </div>

      <div className="space-y-6 p-6">
        <div>
          <h3 className="line-clamp-2 text-xl font-bold text-slate-900">
            {event.title}
          </h3>

          <p className="mt-1 text-sm font-medium text-emerald-600">
            {event.artist}
          </p>

          {event.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
              {event.description}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="h-4 w-4 text-emerald-600" />

            <span>
              {event.city} · {event.venue}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <CalendarDays className="h-4 w-4 text-emerald-600" />

            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="flex justify-end">
          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              bg-emerald-50
              px-4
              py-2
              text-sm
              font-semibold
              text-emerald-700
              transition-all
              duration-300
              group-hover:gap-3
              group-hover:bg-emerald-100
            "
          >
            <span>Vedi evento</span>

            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
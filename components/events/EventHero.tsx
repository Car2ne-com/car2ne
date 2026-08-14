import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

type Props = {
  event: {
    id: string;
    title: string;
    artist: string;
    venue: string;
    city: string;
    category: string;
    description: string | null;
    image_url: string | null;
    event_date: string;
    cities?: { slug: string } | null;
    venues?: { slug: string } | null;
  };
};

export default function EventHero({ event }: Props) {
  const formattedDate = new Intl.DateTimeFormat("it-IT", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(event.event_date));

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-400" />

      <div className="absolute inset-0 bg-black/20" />

      <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-center px-6 py-24">
        <div className="grid w-full gap-14 lg:grid-cols-2 lg:items-center">
          <div className="text-white">
            <h1 className="text-5xl font-black leading-tight md:text-6xl">
              {event.title}
            </h1>

            <p className="mt-3 text-2xl font-semibold text-emerald-100">
              {event.artist}
            </p>

            {event.description && (
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/90">
                {event.description}
              </p>
            )}

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3 text-lg">
                <MapPin className="h-5 w-5" />

                <span>
                  {event.cities ? (
                    <Link
                      href={`/citta/${event.cities.slug}`}
                      className="underline decoration-white/40 underline-offset-4 hover:decoration-white"
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
                      className="underline decoration-white/40 underline-offset-4 hover:decoration-white"
                    >
                      {event.venue}
                    </Link>
                  ) : (
                    event.venue
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3 text-lg">
                <CalendarDays className="h-5 w-5" />

                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/10 shadow-2xl backdrop-blur">
              {event.image_url ? (
                <Image
                  src={event.image_url}
                  alt={event.title}
                  width={1200}
                  height={800}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  priority
                  className="aspect-[16/10] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-white/20 to-white/5">
                  <span className="text-8xl">🎫</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
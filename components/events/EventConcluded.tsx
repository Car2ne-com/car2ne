import Link from "next/link";
import { CalendarCheck, MapPin } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

import type { Locale } from "@/lib/i18n/locales";

type ConcludedDict = {
  badge: string;
  description: string;
  browseEvents: string;
  leaveReviewButton: string;
};

type Props = {
  locale: Locale;
  dict: ConcludedDict;
  event: {
    title: string;
    artist: string;
    city: string;
    venue: string;
    event_date: string;
  };
  reviewHref: string | null;
};

export default function EventConcluded({
  event,
  locale,
  dict,
  reviewHref,
}: Props) {
  const formattedDate = new Intl.DateTimeFormat(
    locale === "en" ? "en-US" : "it-IT",
    {
      dateStyle: "full",
    }
  ).format(new Date(event.event_date));

  return (
    <section className="mx-auto max-w-2xl px-6 pt-6 pb-16 text-center sm:pt-10 sm:pb-24">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <CalendarCheck className="h-7 w-7 text-muted-foreground" />
      </div>

      <span className="mt-5 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
        {dict.badge}
      </span>

      <h1 className="mt-5 text-[1.6rem] font-medium leading-snug tracking-tight text-foreground sm:text-3xl">
        {event.title}
      </h1>

      <p className="mt-2 font-medium text-primary">
        {event.artist}
      </p>

      <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>
          {event.city} · {event.venue}
        </span>
      </div>

      <p className="mt-1 text-muted-foreground">
        {formattedDate}
      </p>

      <p className="mx-auto mt-8 max-w-md text-muted-foreground">
        {dict.description}
      </p>

      <div className="mx-auto mt-8 flex max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
        {reviewHref && (
          <Link
            href={reviewHref}
            className={buttonVariants({ variant: "outline", size: "lg", className: "h-auto px-8 py-3.5 text-base" })}
          >
            {dict.leaveReviewButton}
          </Link>
        )}

        <Link
          href="/events"
          className={buttonVariants({ size: "lg", className: "h-auto px-8 py-3.5 text-base" })}
        >
          {dict.browseEvents}
        </Link>
      </div>
    </section>
  );
}

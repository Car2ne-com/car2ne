import EventCard from "./EventCard";

import { Event } from "@/types/event";
import type { Locale } from "@/lib/i18n/locales";

type CardDict = {
  ridesSingular: string;
  ridesPlural: string;
  viewEvent: string;
};

type Props = {
  events: Event[];
  locale: Locale;
  dict: CardDict;
};

export default function EventGrid({ events, locale, dict }: Props) {
  return (
    <div
      className="
        grid
        gap-8
        sm:grid-cols-2
        xl:grid-cols-3
      "
    >
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          locale={locale}
          dict={dict}
        />
      ))}
    </div>
  );
}
import Link from "next/link";

import { CalendarDays, MapPin } from "lucide-react";

import WatchlistToggleButton from "@/components/events/WatchlistToggleButton";
import { Card } from "@/components/ui/card";

type Dict = {
  viewEvent: string;
};

type WatchlistDict = {
  notifyMe: string;
  stopNotifying: string;
  watchingBadge: string;
  toastAdded: string;
  toastRemoved: string;
  toastError: string;
};

type Props = {
  dict: Dict;
  watchlistDict: WatchlistDict;
  locale: "it" | "en";
  item: {
    eventId: string;
    eventTitle: string;
    eventSlug: string;
    eventVenue: string;
    eventCity: string;
    eventDate: string;
  };
};

export default function WatchlistCard({
  dict,
  watchlistDict,
  locale,
  item,
}: Props) {
  const dateFormatter = new Intl.DateTimeFormat(
    locale === "en" ? "en-US" : "it-IT",
    { dateStyle: "medium" }
  );

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            {item.eventTitle}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {item.eventVenue}, {item.eventCity}
          </div>

          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            {dateFormatter.format(new Date(item.eventDate))}
          </div>
        </div>

        <WatchlistToggleButton
          eventId={item.eventId}
          initiallyWatching
          dict={watchlistDict}
        />
      </div>

      <Link
        href={`/events/${item.eventSlug}`}
        className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline"
      >
        {dict.viewEvent} →
      </Link>
    </Card>
  );
}

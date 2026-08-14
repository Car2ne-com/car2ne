"use client";

import { useMemo, useState } from "react";

import EventSearch from "./EventSearch";
import EventGrid from "./EventGrid";
import EmptyState from "./EmptyState";

import { Event } from "@/types/event";

type Props = {
  events: Event[];
  initialSearch?: string;
  initialDate?: string;
  initialDeparture?: string;
};

export default function EventsView({
  events,
  initialSearch = "",
  initialDate = "",
  initialDeparture = "",
}: Props) {
  const [search, setSearch] =
    useState(initialSearch);

  const filteredEvents = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.city.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query);

      const matchesDate =
        !initialDate ||
        event.event_date.startsWith(initialDate);

      return matchesSearch && matchesDate;
    });
  }, [events, search, initialDate]);

  return (
    <>
      <div className="mb-8">
        <EventSearch
          value={search}
          onChange={setSearch}
        />
      </div>

      {initialDeparture && (
        <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
          <p className="text-sm font-semibold text-emerald-800">
            📍 Partenza cercata
          </p>

          <p className="mt-1 text-sm text-emerald-700">
            Stai cercando passaggi con partenza da{" "}
            <strong>{initialDeparture}</strong>.
          </p>
        </div>
      )}

      {filteredEvents.length > 0 ? (
        <EventGrid events={filteredEvents} />
      ) : (
        <EmptyState />
      )}
    </>
  );
}

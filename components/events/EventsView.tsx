"use client";

import { useEffect, useMemo, useState } from "react";

import EventSearch from "./EventSearch";
import EventGrid from "./EventGrid";
import EmptyState from "./EmptyState";

import { Event } from "@/types/event";

const PAGE_SIZE = 24;

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

  const [visibleCount, setVisibleCount] =
    useState(PAGE_SIZE);

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

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, initialDate]);

  const visibleEvents = filteredEvents.slice(
    0,
    visibleCount
  );

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

      {visibleEvents.length > 0 ? (
        <>
          <EventGrid events={visibleEvents} />

          {visibleCount < filteredEvents.length && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount(
                    (count) => count + PAGE_SIZE
                  )
                }
                className="rounded-2xl border border-slate-200 bg-white px-8 py-3 font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                Carica altri eventi (
                {filteredEvents.length -
                  visibleCount}{" "}
                rimanenti)
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState />
      )}
    </>
  );
}

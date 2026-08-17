"use client";

import { useEffect, useMemo, useState } from "react";

import EventSearch from "./EventSearch";
import EventGrid from "./EventGrid";
import EmptyState from "./EmptyState";

import { Event } from "@/types/event";
import type { Locale } from "@/lib/i18n/locales";

const PAGE_SIZE = 24;

type EventsDict = {
  search: { placeholder: string };
  filters: {
    cityAriaLabel: string;
    allCities: string;
    venueAriaLabel: string;
    allVenues: string;
    departureBadge: string;
    departureSearching: string;
    loadMore: string;
    remaining: string;
  };
  card: {
    ridesSingular: string;
    ridesPlural: string;
    viewEvent: string;
  };
  empty: { title: string; description: string };
};

type Props = {
  events: Event[];
  initialSearch?: string;
  initialDate?: string;
  initialDeparture?: string;
  locale: Locale;
  dict: EventsDict;
};

export default function EventsView({
  events,
  initialSearch = "",
  initialDate = "",
  initialDeparture = "",
  locale,
  dict,
}: Props) {
  const [search, setSearch] =
    useState(initialSearch);

  const [cityId, setCityId] = useState("");
  const [venueId, setVenueId] = useState("");

  const [visibleCount, setVisibleCount] =
    useState(PAGE_SIZE);

  /*
   * Filtro Città/Venue basato sull'entità reale (city_id/venue_id
   * via le relazioni embedded cities/venues), non sul solo testo
   * event.city. Gli eventi senza city_id/venue_id restano visibili
   * di default e semplicemente non compaiono quando si filtra.
   */
  const cityOptions = useMemo(() => {
    const byId = new Map<string, string>();

    events.forEach((event) => {
      if (event.cities) {
        byId.set(event.cities.id, event.cities.name);
      }
    });

    return Array.from(byId.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [events]);

  const eventsInSelectedCity = useMemo(() => {
    if (!cityId) return events;

    return events.filter(
      (event) => event.cities?.id === cityId
    );
  }, [events, cityId]);

  const venueOptions = useMemo(() => {
    const byId = new Map<string, string>();

    eventsInSelectedCity.forEach((event) => {
      if (event.venues) {
        byId.set(event.venues.id, event.venues.name);
      }
    });

    return Array.from(byId.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [eventsInSelectedCity]);

  /*
   * Se il venue selezionato non appartiene più alla città
   * selezionata (es. si cambia città dopo aver scelto un venue),
   * lo si considera implicitamente deselezionato calcolandolo in
   * render invece che con un effect che resetta lo state.
   */
  const effectiveVenueId = venueOptions.some(
    (venue) => venue.id === venueId
  )
    ? venueId
    : "";

  const filteredEvents = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        event.artist.toLowerCase().includes(query) ||
        event.title.toLowerCase().includes(query) ||
        event.city.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query);

      const matchesDate =
        !initialDate ||
        event.event_date.startsWith(initialDate);

      const matchesCity =
        !cityId || event.cities?.id === cityId;

      const matchesVenue =
        !effectiveVenueId || event.venues?.id === effectiveVenueId;

      return (
        matchesSearch &&
        matchesDate &&
        matchesCity &&
        matchesVenue
      );
    });
  }, [events, search, initialDate, cityId, effectiveVenueId]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, initialDate, cityId, effectiveVenueId]);

  const visibleEvents = filteredEvents.slice(
    0,
    visibleCount
  );

  return (
    <>
      <div className="mb-8 space-y-4">
        <EventSearch
          value={search}
          onChange={setSearch}
          placeholder={dict.search.placeholder}
        />

        {cityOptions.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              aria-label={dict.filters.cityAriaLabel}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">{dict.filters.allCities}</option>

              {cityOptions.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>

            {venueOptions.length > 0 && (
              <select
                value={effectiveVenueId}
                onChange={(e) => setVenueId(e.target.value)}
                aria-label={dict.filters.venueAriaLabel}
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="">{dict.filters.allVenues}</option>

                {venueOptions.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {initialDeparture && (
        <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
          <p className="text-sm font-semibold text-emerald-800">
            {dict.filters.departureBadge}
          </p>

          <p className="mt-1 text-sm text-emerald-700">
            {dict.filters.departureSearching}{" "}
            <strong>{initialDeparture}</strong>.
          </p>
        </div>
      )}

      {visibleEvents.length > 0 ? (
        <>
          <EventGrid events={visibleEvents} locale={locale} dict={dict.card} />

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
                {dict.filters.loadMore} (
                {filteredEvents.length -
                  visibleCount}{" "}
                {dict.filters.remaining})
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState title={dict.empty.title} description={dict.empty.description} />
      )}
    </>
  );
}

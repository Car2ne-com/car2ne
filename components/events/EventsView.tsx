"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import EventSearch from "./EventSearch";
import EventGrid from "./EventGrid";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { Event } from "@/types/event";
import type { Locale } from "@/lib/i18n/locales";

const SEARCH_DEBOUNCE_MS = 400;

type FilterOption = { id: string; name: string };

type EventsDict = {
  search: { placeholder: string };
  filters: {
    cityAriaLabel: string;
    allCities: string;
    venueAriaLabel: string;
    allVenues: string;
    departureBadge: string;
    departureSearching: string;
    resultsCount: string;
    previous: string;
    next: string;
    pageIndicator: string;
  };
  card: {
    ridesSingular: string;
    ridesPlural: string;
    viewEvent: string;
  };
  empty: { title: string; description: string; suggestCta: string };
};

type Props = {
  events: Event[];
  totalCount: number;
  page: number;
  totalPages: number;
  cityOptions: FilterOption[];
  venueOptions: FilterOption[];
  initialSearch?: string;
  initialCity?: string;
  initialVenue?: string;
  initialDeparture?: string;
  locale: Locale;
  dict: EventsDict;
};

export default function EventsView({
  events,
  totalCount,
  page,
  totalPages,
  cityOptions,
  venueOptions,
  initialSearch = "",
  initialCity = "",
  initialVenue = "",
  initialDeparture = "",
  locale,
  dict,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
   * Ricerca/filtri/paginazione girano lato server (vedi
   * app/events/page.tsx): ogni cambiamento aggiorna l'URL, che
   * ritrigghera il render server con i nuovi searchParams. startTransition
   * evita che l'interazione (digitare, cambiare select) sembri bloccata
   * in attesa della risposta.
   */
  function navigate(overrides: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(overrides)) {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    }

    /*
     * Qualunque cambio di filtro invalida la pagina corrente: restare
     * su "pagina 3" quando i risultati sono appena cambiati mostrerebbe
     * un elenco vuoto o troncato.
     */
    if (!("page" in overrides)) {
      next.delete("page");
    }

    startTransition(() => {
      router.push(`/events?${next.toString()}`);
    });
  }

  function handleSearchChange(value: string) {
    setSearch(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      navigate({ search: value.trim() || null });
    }, SEARCH_DEBOUNCE_MS);
  }

  function handleCityChange(cityId: string) {
    /*
     * Le opzioni venue dipendono dalla città: cambiandola, un venue già
     * selezionato potrebbe non appartenerci più.
     */
    navigate({ city: cityId || null, venue: null });
  }

  function handleVenueChange(venueId: string) {
    navigate({ venue: venueId || null });
  }

  function goToPage(nextPage: number) {
    navigate({ page: String(nextPage) });
  }

  return (
    <>
      <div className="mb-8 space-y-4">
        <EventSearch
          value={search}
          onChange={handleSearchChange}
          placeholder={dict.search.placeholder}
        />

        {cityOptions.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <Select
              value={initialCity}
              onChange={(e) => handleCityChange(e.target.value)}
              aria-label={dict.filters.cityAriaLabel}
              containerClassName="w-auto max-w-full"
              className="h-12 w-auto max-w-full rounded-2xl pr-9 text-sm font-medium shadow-sm"
            >
              <option value="">{dict.filters.allCities}</option>

              {cityOptions.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>

            {venueOptions.length > 0 && (
              <Select
                value={initialVenue}
                onChange={(e) => handleVenueChange(e.target.value)}
                aria-label={dict.filters.venueAriaLabel}
                containerClassName="w-auto max-w-full"
                className="h-12 w-auto max-w-full rounded-2xl pr-9 text-sm font-medium shadow-sm"
              >
                <option value="">{dict.filters.allVenues}</option>

                {venueOptions.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </Select>
            )}
          </div>
        )}
      </div>

      {initialDeparture && (
        <div className="mb-8 rounded-2xl bg-accent px-5 py-4">
          <p className="text-sm font-semibold text-accent-foreground">
            {dict.filters.departureBadge}
          </p>

          <p className="mt-1 text-sm text-accent-foreground">
            {dict.filters.departureSearching}{" "}
            <strong>{initialDeparture}</strong>.
          </p>
        </div>
      )}

      {totalCount > 0 ? (
        <div
          className={
            isPending
              ? "opacity-60 transition-opacity"
              : "transition-opacity"
          }
        >
          <p className="mb-4 text-sm text-muted-foreground">
            {dict.filters.resultsCount.replace(
              "{count}",
              String(totalCount)
            )}
          </p>

          <EventGrid events={events} locale={locale} dict={dict.card} />

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={page <= 1 || isPending}
                onClick={() => goToPage(page - 1)}
                className="h-auto rounded-2xl px-6 py-3 text-base"
              >
                {dict.filters.previous}
              </Button>

              <span className="text-sm font-medium text-muted-foreground">
                {dict.filters.pageIndicator
                  .replace("{page}", String(page))
                  .replace("{total}", String(totalPages))}
              </span>

              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={page >= totalPages || isPending}
                onClick={() => goToPage(page + 1)}
                className="h-auto rounded-2xl px-6 py-3 text-base"
              >
                {dict.filters.next}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState title={dict.empty.title} description={dict.empty.description}>
          <Link
            href="/segnala-evento"
            className="mt-6 inline-block text-sm font-semibold text-primary hover:underline"
          >
            {dict.empty.suggestCta}
          </Link>
        </EmptyState>
      )}
    </>
  );
}

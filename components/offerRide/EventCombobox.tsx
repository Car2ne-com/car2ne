"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { Event } from "@/types/event";

type Props = {
  events: Event[];
  value: string;
  onChange: (eventId: string) => void;
  loading?: boolean;
};

const MAX_RESULTS = 50;

export default function EventCombobox({
  events,
  value,
  onChange,
  loading,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedEvent =
    events.find((event) => event.id === value) ?? null;

  const filteredEvents = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) return events;

    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(q) ||
        event.artist.toLowerCase().includes(q) ||
        event.city.toLowerCase().includes(q)
    );
  }, [events, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  function handleSelect(eventId: string) {
    onChange(eventId);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-left outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      >
        <span
          className={
            selectedEvent
              ? "truncate text-slate-900"
              : "text-slate-400"
          }
        >
          {loading
            ? "Caricamento eventi..."
            : selectedEvent
              ? `${selectedEvent.title} — ${selectedEvent.city}`
              : "Seleziona un evento"}
        </span>

        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />

            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="Cerca per titolo, artista o città..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {filteredEvents.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                Nessun evento trovato.
              </p>
            ) : (
              filteredEvents
                .slice(0, MAX_RESULTS)
                .map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() =>
                      handleSelect(event.id)
                    }
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition hover:bg-emerald-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-slate-900">
                        {event.title}
                      </span>

                      <span className="block truncate text-xs text-slate-500">
                        {event.artist} ·{" "}
                        {event.city}
                      </span>
                    </span>

                    {event.id === value && (
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    )}
                  </button>
                ))
            )}

            {filteredEvents.length > MAX_RESULTS && (
              <p className="px-4 py-2 text-center text-xs text-slate-400">
                Altri{" "}
                {filteredEvents.length -
                  MAX_RESULTS}{" "}
                risultati, affina la ricerca.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

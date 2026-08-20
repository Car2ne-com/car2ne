"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Event } from "@/types/event";

type EventComboboxDict = {
  loading: string;
  placeholder: string;
  searchPlaceholder: string;
  noResults: string;
  moreResults: string;
};

type Props = {
  events: Event[];
  value: string;
  onChange: (eventId: string) => void;
  loading?: boolean;
  dict: EventComboboxDict;
};

const MAX_RESULTS = 50;

export default function EventCombobox({
  events,
  value,
  onChange,
  loading,
  dict,
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
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((current) => !current)}
        className="h-14 w-full justify-between rounded-2xl px-4 text-left font-normal"
      >
        <span
          className={
            selectedEvent
              ? "truncate text-foreground"
              : "text-muted-foreground"
          }
        >
          {loading
            ? dict.loading
            : selectedEvent
              ? `${selectedEvent.title} — ${selectedEvent.city}`
              : dict.placeholder}
        </span>

        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Button>

      {open && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder={dict.searchPlaceholder}
              className="w-full bg-transparent text-sm text-popover-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {filteredEvents.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                {dict.noResults}
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
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition hover:bg-accent"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-popover-foreground">
                        {event.title}
                      </span>

                      <span className="block truncate text-xs text-muted-foreground">
                        {event.artist} ·{" "}
                        {event.city}
                      </span>
                    </span>

                    {event.id === value && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                ))
            )}

            {filteredEvents.length > MAX_RESULTS && (
              <p className="px-4 py-2 text-center text-xs text-muted-foreground">
                {dict.moreResults.replace(
                  "{count}",
                  String(filteredEvents.length - MAX_RESULTS)
                )}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

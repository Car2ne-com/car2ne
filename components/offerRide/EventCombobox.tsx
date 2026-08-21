"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import {
  Combobox,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxPopup,
  ComboboxPortal,
  ComboboxPositioner,
  ComboboxTrigger,
} from "@/components/ui/combobox";

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

/*
 * Filtra `events` (già caricato interamente dal parent) lato client per
 * titolo/artista/città, mostrando al massimo MAX_RESULTS risultati con un
 * hint per il resto. Navigazione tastiera, apertura/chiusura ed
 * evidenziazione sono delegate a @base-ui/react's Combobox primitive.
 */
export default function EventCombobox({
  events,
  value,
  onChange,
  loading,
  dict,
}: Props) {
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState<Event | null>(null);

  const selectedEvent = events.find((event) => event.id === value) ?? null;

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

  const visibleEvents = useMemo(
    () => filteredEvents.slice(0, MAX_RESULTS),
    [filteredEvents]
  );

  function handleSelect(eventId: string) {
    onChange(eventId);
    setQuery("");
    setHighlighted(null);
  }

  return (
    <Combobox<Event>
      items={visibleEvents}
      filter={null}
      inputValue={query}
      onInputValueChange={(next) => setQuery(next)}
      value={selectedEvent}
      onValueChange={(next) => {
        if (next) handleSelect(next.id);
      }}
      onItemHighlighted={(val) => setHighlighted(val ?? null)}
      isItemEqualToValue={(item, val) => item?.id === val?.id}
      autoHighlight
    >
      <ComboboxTrigger
        type="button"
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
      </ComboboxTrigger>

      <ComboboxPortal>
        <ComboboxPositioner>
          <ComboboxPopup>
            <ComboboxInputGroup className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

              <ComboboxInput
                placeholder={dict.searchPlaceholder}
                className="h-auto w-full border-0 bg-transparent p-0 text-sm text-popover-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                onKeyDown={(event) => {
                  /*
                   * Fallback difensivo: in test automatizzati Invio non
                   * ha sempre scatenato la selezione nativa di Combobox
                   * (clickHighlightedItem cerca il nodo evidenziato in
                   * store.state.listRef). Non è stato possibile
                   * verificare in modo conclusivo se sia un problema
                   * reale della libreria o dell'ambiente di test
                   * (l'evento sintetico non riportava key:"Enter" in modo
                   * affidabile). Selezioniamo comunque noi stessi in base
                   * all'ultimo elemento evidenziato tracciato via
                   * onItemHighlighted: innocuo anche se il comportamento
                   * nativo funziona già (selezionerebbe due volte lo
                   * stesso valore).
                   */
                  if (event.key === "Enter" && highlighted) {
                    handleSelect(highlighted.id);
                  }
                }}
              />
            </ComboboxInputGroup>

            <ComboboxList className="max-h-72 overflow-y-auto py-1">
              {visibleEvents.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  {dict.noResults}
                </p>
              ) : (
                (event: Event) => (
                  <ComboboxItem key={event.id} value={event}>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-popover-foreground">
                        {event.title}
                      </span>

                      <span className="block truncate text-xs text-muted-foreground">
                        {event.artist} · {event.city}
                      </span>
                    </span>

                    <ComboboxItemIndicator className="shrink-0">
                      <Check className="h-4 w-4" />
                    </ComboboxItemIndicator>
                  </ComboboxItem>
                )
              )}
            </ComboboxList>

            {filteredEvents.length > MAX_RESULTS && (
              <p className="px-4 py-2 text-center text-xs text-muted-foreground">
                {dict.moreResults.replace(
                  "{count}",
                  String(filteredEvents.length - MAX_RESULTS)
                )}
              </p>
            )}
          </ComboboxPopup>
        </ComboboxPositioner>
      </ComboboxPortal>
    </Combobox>
  );
}

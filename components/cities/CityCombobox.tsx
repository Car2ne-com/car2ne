"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxPortal,
  ComboboxPositioner,
} from "@/components/ui/combobox";

type City = {
  id: string;
  name: string;
  region: string | null;
};

type CityComboboxDict = {
  changeCityAriaLabel: string;
  searching: string;
  searchFailed: string;
  noCityFound: string;
  minCharsHint: string;
  selectSuggestion: string;
  placeholder: string;
};

const defaultDict: CityComboboxDict = {
  changeCityAriaLabel: "Cambia città",
  searching: "Ricerca in corso...",
  searchFailed: "Ricerca non riuscita. Riprova.",
  noCityFound: "Nessun comune trovato.",
  minCharsHint: "Scrivi almeno {count} caratteri per cercare.",
  selectSuggestion: "Seleziona un comune dai suggerimenti.",
  placeholder: "Cerca un comune...",
};

type Props = {
  value: string;
  onChange: (cityId: string, cityName: string) => void;
  /*
   * Nome da mostrare per `value` finché non è stata fatta una nuova
   * ricerca (es. in modifica: si conosce già city_id + il nome
   * testuale denormalizzato, senza bisogno di una query aggiuntiva).
   */
  initialLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  dict?: CityComboboxDict;
};

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

/*
 * Combobox riutilizzabile per selezionare un comune italiano reale
 * da public.cities (7.894+ righe). La ricerca è server-side
 * (GET /api/cities/search), con debounce: niente caricamento
 * dell'intera tabella lato client, niente query per ogni carattere
 * digitato.
 *
 * value è sempre e solo l'id della città (o "" se nessuna selezione
 * valida) — mai testo libero. Digitare senza scegliere un
 * suggerimento azzera il valore: il campo torna "non compilato" agli
 * occhi del form che lo usa.
 *
 * La ricerca/navigazione tastiera è delegata a @base-ui/react's
 * Combobox primitive (apertura/chiusura, click-outside, evidenziazione
 * con le frecce, Invio per selezionare): qui restano solo la logica di
 * business (fetch debounced, race-safety via requestId, stato di
 * conferma/errore) e lo stile.
 */
export default function CityCombobox({
  value,
  onChange,
  initialLabel,
  placeholder,
  disabled,
  dict = defaultDict,
}: Props) {
  const resolvedPlaceholder = placeholder ?? dict.placeholder;
  const [selected, setSelected] = useState<City | null>(
    value && initialLabel
      ? { id: value, name: initialLabel, region: null }
      : null
  );

  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState<City | null>(null);
  const [results, setResults] = useState<City[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (trimmed.length < MIN_QUERY_LENGTH) {
      /*
       * Nessuno stato da azzerare qui: il rendering sotto già
       * nasconde risultati/stato di ricerca quando la query è troppo
       * corta (query.trim().length >= MIN_QUERY_LENGTH), quindi
       * `results`/`searching` residui restano semplicemente inutilizzati
       * finché non riparte una nuova ricerca valida.
       */
      requestIdRef.current += 1;
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;

      setSearching(true);

      try {
        const response = await fetch(
          `/api/cities/search?q=${encodeURIComponent(trimmed)}`
        );

        if (requestId !== requestIdRef.current) {
          // una ricerca più recente è già partita, questa risposta è superata
          return;
        }

        if (!response.ok) {
          setSearchError(true);
          setResults([]);
          return;
        }

        const data = await response.json();

        setSearchError(false);
        setResults(data.cities ?? []);
      } catch {
        if (requestId === requestIdRef.current) {
          setSearchError(true);
          setResults([]);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setSearching(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  function handleSelect(city: City) {
    setSelected(city);
    onChange(city.id, city.name);
    setQuery("");
    setResults([]);
    setOpen(false);
    setTouched(false);
    setHighlighted(null);
  }

  function handleClear() {
    setSelected(null);
    onChange("", "");
    setQuery("");
    setTouched(false);
  }

  const showUnconfirmedError =
    touched && !value && query.trim().length >= MIN_QUERY_LENGTH;

  const showTooShortHint =
    open &&
    query.trim().length > 0 &&
    query.trim().length < MIN_QUERY_LENGTH;

  // Il popup si apre solo con una query abbastanza lunga da avere senso:
  // sotto soglia mostriamo l'hint dei caratteri minimi al suo posto.
  const showPanel = open && query.trim().length >= MIN_QUERY_LENGTH;

  /*
   * Selezione confermata: chip di sola lettura con possibilità di
   * cambiare città (riapre la ricerca).
   */
  if (selected && !open) {
    return (
      <div className="flex h-14 items-center justify-between rounded-2xl bg-accent px-4">
        <span className="flex items-center gap-2 font-semibold text-accent-foreground">
          <Check className="h-4 w-4 shrink-0" />
          {selected.name}
          {selected.region ? `, ${selected.region}` : ""}
        </span>

        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleClear}
            aria-label={dict.changeCityAriaLabel}
            className="text-accent-foreground hover:bg-primary/10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Combobox<City>
        items={results}
        filter={null}
        inputValue={query}
        onInputValueChange={(next) => setQuery(next)}
        open={showPanel}
        onOpenChange={(next) => setOpen(next)}
        onItemHighlighted={(val) => setHighlighted(val ?? null)}
        disabled={disabled}
        autoHighlight
      >
        <ComboboxInputGroup>
          <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <ComboboxInput
            placeholder={resolvedPlaceholder}
            className="h-14 rounded-2xl pl-11"
            onFocus={() => setOpen(true)}
            onBlur={() => setTouched(true)}
            onKeyDown={(event) => {
              /*
               * Fallback difensivo: vedi lo stesso commento in
               * EventCombobox.tsx — non è stato possibile verificare in
               * modo conclusivo se la selezione nativa di Combobox su
               * Invio funzioni sempre in questo ambiente di test.
               * Innocuo anche se il comportamento nativo funziona già.
               */
              if (event.key === "Enter" && highlighted) {
                handleSelect(highlighted);
              }
            }}
          />
        </ComboboxInputGroup>

        <ComboboxPortal>
          <ComboboxPositioner>
            <ComboboxPopup className="max-h-64 py-2">
              <ComboboxList>
                {searching ? (
                  <p className="px-4 py-2.5 text-sm text-muted-foreground">
                    {dict.searching}
                  </p>
                ) : searchError ? (
                  <p className="px-4 py-2.5 text-sm text-destructive">
                    {dict.searchFailed}
                  </p>
                ) : results.length === 0 ? (
                  <p className="px-4 py-2.5 text-sm text-muted-foreground">
                    {dict.noCityFound}
                  </p>
                ) : (
                  (city: City, index: number) => (
                    <ComboboxItem
                      key={city.id}
                      value={city}
                      index={index}
                      onClick={() => handleSelect(city)}
                    >
                      <span className="font-medium text-popover-foreground">
                        {city.name}
                      </span>

                      {city.region && (
                        <span className="text-xs text-muted-foreground">
                          {city.region}
                        </span>
                      )}
                    </ComboboxItem>
                  )
                )}
              </ComboboxList>
            </ComboboxPopup>
          </ComboboxPositioner>
        </ComboboxPortal>
      </Combobox>

      {showTooShortHint && (
        <p className="mt-2 text-xs text-muted-foreground">
          {dict.minCharsHint.replace("{count}", String(MIN_QUERY_LENGTH))}
        </p>
      )}

      {showUnconfirmedError && (
        <p className="mt-2 text-xs font-medium text-destructive">
          {dict.selectSuggestion}
        </p>
      )}
    </div>
  );
}

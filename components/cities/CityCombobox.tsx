"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Search, X } from "lucide-react";

type City = {
  id: string;
  name: string;
  region: string | null;
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
 */
export default function CityCombobox({
  value,
  onChange,
  initialLabel,
  placeholder = "Cerca un comune...",
  disabled,
}: Props) {
  const [selected, setSelected] = useState<City | null>(
    value && initialLabel
      ? { id: value, name: initialLabel, region: null }
      : null
  );

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  /*
   * Selezione confermata: chip di sola lettura con possibilità di
   * cambiare città (riapre la ricerca).
   */
  if (selected && !open) {
    return (
      <div className="flex h-14 items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4">
        <span className="flex items-center gap-2 font-semibold text-emerald-800">
          <Check className="h-4 w-4 shrink-0" />
          {selected.name}
          {selected.region ? `, ${selected.region}` : ""}
        </span>

        {!disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Cambia città"
            className="text-emerald-600 transition hover:text-emerald-800"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex h-14 items-center rounded-2xl border border-slate-200 px-4 outline-none transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100">
        <Search className="mr-3 h-4 w-4 shrink-0 text-slate-400" />

        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          className="h-full w-full bg-transparent outline-none disabled:cursor-not-allowed"
        />
      </div>

      {open && query.trim().length >= MIN_QUERY_LENGTH && (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
          {searching ? (
            <p className="px-4 py-2.5 text-sm text-slate-500">
              Ricerca in corso...
            </p>
          ) : searchError ? (
            <p className="px-4 py-2.5 text-sm text-red-600">
              Ricerca non riuscita. Riprova.
            </p>
          ) : results.length > 0 ? (
            results.map((city) => (
              <button
                key={city.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(city)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-emerald-50"
              >
                <span className="font-medium text-slate-800">
                  {city.name}
                </span>

                {city.region && (
                  <span className="text-xs text-slate-400">
                    {city.region}
                  </span>
                )}
              </button>
            ))
          ) : (
            <p className="px-4 py-2.5 text-sm text-slate-500">
              Nessun comune trovato.
            </p>
          )}
        </div>
      )}

      {showTooShortHint && (
        <p className="mt-2 text-xs text-slate-400">
          Scrivi almeno {MIN_QUERY_LENGTH} caratteri per cercare.
        </p>
      )}

      {showUnconfirmedError && (
        <p className="mt-2 text-xs font-medium text-red-600">
          Seleziona un comune dai suggerimenti.
        </p>
      )}
    </div>
  );
}

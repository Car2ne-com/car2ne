"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  CheckCircle2,
  Pencil,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "./ConfirmDialog";

type Event = {
  id: string;
  title: string;
  artist: string;
  city: string;
  venue: string;
  event_date: string;
  status: string;
  source: string | null;
  external_id: string | null;
  imported_at: string | null;
};

type Filter =
  | "all"
  | "imported"
  | "pending"
  | "published"
  | "rejected";

type Props = {
  events: Event[];
  initialFilter?: string;
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tutti" },
  { key: "imported", label: "Importati" },
  { key: "pending", label: "In attesa" },
  { key: "published", label: "Pubblicati" },
  { key: "rejected", label: "Rifiutati" },
];

function isFilter(value: string | undefined): value is Filter {
  return FILTERS.some((item) => item.key === value);
}

const PAGE_SIZE = 50;

type PendingConfirm =
  | { kind: "bulk"; status: "published" | "rejected" }
  | { kind: "delete"; id: string; title: string }
  | null;

function uniqueSorted(values: (string | null)[]): string[] {
  return Array.from(
    new Set(values.filter((v): v is string => !!v))
  ).sort((a, b) => a.localeCompare(b));
}

export default function AdminEventTable({
  events,
  initialFilter,
}: Props) {
  const router = useRouter();

  const [filter, setFilter] = useState<Filter>(
    isFilter(initialFilter) ? initialFilter : "all"
  );
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [venueFilter, setVenueFilter] = useState("");
  const [artistFilter, setArtistFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState<
    "all" | "ticketmaster" | "manual"
  >("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set()
  );
  const [bulkBusy, setBulkBusy] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [pendingConfirm, setPendingConfirm] =
    useState<PendingConfirm>(null);

  const cityOptions = useMemo(
    () => uniqueSorted(events.map((e) => e.city)),
    [events]
  );

  const venueOptions = useMemo(
    () => uniqueSorted(events.map((e) => e.venue)),
    [events]
  );

  const artistOptions = useMemo(
    () => uniqueSorted(events.map((e) => e.artist)),
    [events]
  );

  const tabFilteredEvents = useMemo(() => {
    if (filter === "imported") {
      return events.filter((event) => !!event.source);
    }

    if (filter === "pending") {
      return events.filter((event) => event.status === "draft");
    }

    if (filter === "published") {
      return events.filter(
        (event) => event.status === "published"
      );
    }

    if (filter === "rejected") {
      return events.filter(
        (event) => event.status === "rejected"
      );
    }

    // "Tutti" = tutti gli eventi operativi, qualsiasi stato.
    return events;
  }, [events, filter]);

  const filteredEvents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return tabFilteredEvents.filter((event) => {
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.artist.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query) ||
        event.city.toLowerCase().includes(query);

      const matchesCity =
        !cityFilter || event.city === cityFilter;

      const matchesVenue =
        !venueFilter || event.venue === venueFilter;

      const matchesArtist =
        !artistFilter || event.artist === artistFilter;

      const matchesSource =
        sourceFilter === "all" ||
        (sourceFilter === "ticketmaster"
          ? !!event.source
          : !event.source);

      const eventDay = event.event_date.slice(0, 10);

      const matchesDateFrom =
        !dateFrom || eventDay >= dateFrom;

      const matchesDateTo = !dateTo || eventDay <= dateTo;

      return (
        matchesSearch &&
        matchesCity &&
        matchesVenue &&
        matchesArtist &&
        matchesSource &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [
    tabFilteredEvents,
    search,
    cityFilter,
    venueFilter,
    artistFilter,
    sourceFilter,
    dateFrom,
    dateTo,
  ]);

  /*
   * Reset della paginazione quando cambia un qualunque filtro/ricerca:
   * aggiustamento di stato durante il render (pattern React
   * consigliato per "adjusting state when a prop changes"), non in
   * un useEffect — evita il giro extra di render e il relativo
   * cascading-render lint warning.
   */
  const filterKey = [
    filter,
    search,
    cityFilter,
    venueFilter,
    artistFilter,
    sourceFilter,
    dateFrom,
    dateTo,
  ].join("|");

  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  const visibleEvents = filteredEvents.slice(0, visibleCount);

  const hasActiveFilters =
    !!search ||
    !!cityFilter ||
    !!venueFilter ||
    !!artistFilter ||
    sourceFilter !== "all" ||
    !!dateFrom ||
    !!dateTo;

  function resetFilters() {
    setSearch("");
    setCityFilter("");
    setVenueFilter("");
    setArtistFilter("");
    setSourceFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  const allFilteredSelected =
    filteredEvents.length > 0 &&
    filteredEvents.every((event) => selectedIds.has(event.id));

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      if (allFilteredSelected) {
        const next = new Set(prev);

        filteredEvents.forEach((event) => next.delete(event.id));

        return next;
      }

      const next = new Set(prev);

      filteredEvents.forEach((event) => next.add(event.id));

      return next;
    });
  }

  async function confirmBulkUpdateStatus(
    status: "published" | "rejected"
  ) {
    const ids = Array.from(selectedIds);

    if (ids.length === 0) return;

    setBulkBusy(true);

    try {
      const response = await fetch(
        "/api/admin/events/bulk-status",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids, status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Operazione fallita.");
        return;
      }

      const skippedNote =
        data.skippedConcluded > 0
          ? ` (${data.skippedConcluded} esclusi perché nel frattempo conclusi)`
          : "";

      toast.success(
        (status === "published"
          ? `${data.updated} eventi pubblicati!`
          : `${data.updated} eventi rifiutati.`) + skippedNote
      );

      setSelectedIds(new Set());
      router.refresh();
    } catch {
      toast.error("Impossibile contattare il server.");
    } finally {
      setBulkBusy(false);
      setPendingConfirm(null);
    }
  }

  async function confirmDeleteEvent(id: string) {
    setBusyId(id);

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Eliminazione fallita.");
        return;
      }

      toast.success("Evento eliminato!");
      router.refresh();
    } catch {
      toast.error("Impossibile contattare il server.");
    } finally {
      setBusyId(null);
      setPendingConfirm(null);
    }
  }

  async function updateStatus(
    id: string,
    title: string,
    status: "published" | "rejected"
  ) {
    setBusyId(id);

    try {
      const response = await fetch(
        `/api/admin/events/${id}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Operazione fallita.");
        return;
      }

      toast.success(
        status === "published"
          ? `"${title}" pubblicato!`
          : `"${title}" rifiutato.`
      );

      router.refresh();
    } catch {
      toast.error("Impossibile contattare il server.");
    } finally {
      setBusyId(null);
    }
  }

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <h2 className="text-2xl font-bold">Nessun evento</h2>

        <p className="mt-2 text-slate-500">
          Crea il primo evento dal pulsante in alto.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Ricerca */}

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per titolo, artista, venue o città..."
          className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4 outline-none focus:border-emerald-500"
        />
      </div>

      {/* Filtri */}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          aria-label="Filtra per città"
          className="h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
        >
          <option value="">Tutte le città</option>
          {cityOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select
          value={venueFilter}
          onChange={(e) => setVenueFilter(e.target.value)}
          aria-label="Filtra per venue"
          className="h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
        >
          <option value="">Tutti i venue</option>
          {venueOptions.map((venue) => (
            <option key={venue} value={venue}>
              {venue}
            </option>
          ))}
        </select>

        <select
          value={artistFilter}
          onChange={(e) => setArtistFilter(e.target.value)}
          aria-label="Filtra per artista"
          className="h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
        >
          <option value="">Tutti gli artisti</option>
          {artistOptions.map((artist) => (
            <option key={artist} value={artist}>
              {artist}
            </option>
          ))}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) =>
            setSourceFilter(
              e.target.value as "all" | "ticketmaster" | "manual"
            )
          }
          aria-label="Filtra per fonte"
          className="h-11 rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
        >
          <option value="all">Tutte le fonti</option>
          <option value="ticketmaster">Ticketmaster</option>
          <option value="manual">Manuale</option>
        </select>

        <label className="flex items-center gap-1.5 text-sm text-slate-500">
          Da
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Data evento da"
            className="h-11 rounded-xl border border-slate-300 px-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
          />
        </label>

        <label className="flex items-center gap-1.5 text-sm text-slate-500">
          A
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="Data evento a"
            className="h-11 rounded-xl border border-slate-300 px-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
          />
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-semibold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
          >
            Cancella filtri
          </button>
        )}
      </div>

      {/* Tab di stato */}

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              filter === item.key
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3">
          <span className="text-sm font-semibold text-emerald-800">
            {selectedIds.size} selezionati
          </span>

          <button
            type="button"
            onClick={() =>
              setPendingConfirm({ kind: "bulk", status: "published" })
            }
            disabled={bulkBusy}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Approva selezionati
          </button>

          <button
            type="button"
            onClick={() =>
              setPendingConfirm({ kind: "bulk", status: "rejected" })
            }
            disabled={bulkBusy}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Rifiuta selezionati
          </button>

          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            disabled={bulkBusy}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Deseleziona tutto
          </button>
        </div>
      )}

      {filteredEvents.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <h2 className="text-xl font-bold">
            Nessun evento corrisponde ai filtri
          </h2>

          <p className="mt-2 text-slate-500">
            Prova a modificare ricerca o filtri.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300"
                    aria-label="Seleziona tutti gli eventi filtrati"
                  />
                </th>

                <th className="px-6 py-4 text-left">Evento</th>
                <th className="px-6 py-4 text-left">Artista</th>
                <th className="px-6 py-4 text-left">Data</th>
                <th className="px-6 py-4 text-left">Città</th>
                <th className="px-6 py-4 text-left">Venue</th>
                <th className="px-6 py-4 text-left">Fonte</th>
                <th className="px-6 py-4 text-left">Stato</th>

                <th className="sticky right-0 z-10 bg-slate-50 px-6 py-4 text-center shadow-[-6px_0_8px_-4px_rgba(15,23,42,0.12)]">
                  Azioni
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleEvents.map((event) => (
                <tr
                  key={event.id}
                  className="border-t border-slate-100"
                >
                  <td className="px-6 py-5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(event.id)}
                      onChange={() => toggleSelect(event.id)}
                      className="h-4 w-4 rounded border-slate-300"
                      aria-label={`Seleziona ${event.title}`}
                    />
                  </td>

                  <td className="px-6 py-5 font-semibold">
                    {event.title}
                  </td>

                  <td className="px-6 py-5">{event.artist}</td>

                  <td className="px-6 py-5">
                    {new Date(event.event_date).toLocaleDateString(
                      "it-IT"
                    )}
                  </td>

                  <td className="px-6 py-5">{event.city}</td>

                  <td className="px-6 py-5">{event.venue}</td>

                  <td className="px-6 py-5">
                    {event.source ? (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {event.source === "ticketmaster"
                          ? "Ticketmaster"
                          : event.source}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        Manuale
                      </span>
                    )}

                    {event.external_id && (
                      <p className="mt-1 text-[11px] text-slate-400">
                        ID: {event.external_id}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge status={event.status} />
                  </td>

                  <td className="sticky right-0 z-10 bg-white px-6 py-5 shadow-[-6px_0_8px_-4px_rgba(15,23,42,0.12)]">
                    <div className="flex justify-center gap-3">
                      {event.status !== "published" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              event.id,
                              event.title,
                              "published"
                            )
                          }
                          disabled={busyId === event.id}
                          title="Approva e pubblica"
                          aria-label={`Approva e pubblica ${event.title}`}
                          className="rounded-xl bg-emerald-500 p-3 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}

                      {event.status !== "rejected" &&
                        event.status !== "published" && (
                          <button
                            onClick={() =>
                              updateStatus(
                                event.id,
                                event.title,
                                "rejected"
                              )
                            }
                            disabled={busyId === event.id}
                            title="Rifiuta"
                            aria-label={`Rifiuta ${event.title}`}
                            className="rounded-xl bg-amber-500 p-3 text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}

                      <Link
                        href={`/admin/events/${event.id}`}
                        title="Modifica"
                        aria-label={`Modifica ${event.title}`}
                        className="rounded-xl bg-blue-500 p-3 text-white transition hover:bg-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>

                      <button
                        onClick={() =>
                          setPendingConfirm({
                            kind: "delete",
                            id: event.id,
                            title: event.title,
                          })
                        }
                        disabled={busyId === event.id}
                        title="Elimina"
                        aria-label={`Elimina ${event.title}`}
                        className="rounded-xl bg-red-500 p-3 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {visibleCount < filteredEvents.length && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((count) => count + PAGE_SIZE)
            }
            className="rounded-2xl border border-slate-200 bg-white px-8 py-3 font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            Carica altri (
            {filteredEvents.length - visibleCount} rimanenti)
          </button>
        </div>
      )}

      <ConfirmDialog
        open={pendingConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setPendingConfirm(null);
        }}
        title={
          pendingConfirm?.kind === "delete"
            ? "Elimina evento"
            : pendingConfirm?.status === "published"
              ? "Pubblica eventi selezionati"
              : "Rifiuta eventi selezionati"
        }
        description={
          pendingConfirm?.kind === "delete"
            ? `Vuoi eliminare "${pendingConfirm.title}"? Questa operazione è irreversibile. Se vuoi solo scartarlo mantenendo la cronologia, usa "Rifiuta" invece.`
            : pendingConfirm?.status === "published"
              ? `Stai per pubblicare ${selectedIds.size} eventi.`
              : `Stai per rifiutare ${selectedIds.size} eventi.`
        }
        confirmLabel={
          pendingConfirm?.kind === "delete"
            ? "Elimina"
            : pendingConfirm?.status === "published"
              ? "Pubblica"
              : "Rifiuta"
        }
        confirmTone={
          pendingConfirm?.kind === "delete"
            ? "danger"
            : pendingConfirm?.status === "published"
              ? "default"
              : "warning"
        }
        busy={
          pendingConfirm?.kind === "delete" ? busyId !== null : bulkBusy
        }
        onConfirm={() => {
          if (!pendingConfirm) return;

          if (pendingConfirm.kind === "delete") {
            confirmDeleteEvent(pendingConfirm.id);
          } else {
            confirmBulkUpdateStatus(pendingConfirm.status);
          }
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        Pubblicato
      </span>
    );
  }

  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Annullato
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
        Rifiutato
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
      In attesa
    </span>
  );
}

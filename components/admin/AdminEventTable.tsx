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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

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
      <EmptyState
        title="Nessun evento"
        description="Crea il primo evento dal pulsante in alto."
      />
    );
  }

  return (
    <div>
      {/* Ricerca */}

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per titolo, artista, venue o città..."
          className="h-12 pl-11"
        />
      </div>

      {/* Filtri */}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          aria-label="Filtra per città"
          containerClassName="w-auto"
        >
          <option value="">Tutte le città</option>
          {cityOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>

        <Select
          value={venueFilter}
          onChange={(e) => setVenueFilter(e.target.value)}
          aria-label="Filtra per venue"
          containerClassName="w-auto"
        >
          <option value="">Tutti i venue</option>
          {venueOptions.map((venue) => (
            <option key={venue} value={venue}>
              {venue}
            </option>
          ))}
        </Select>

        <Select
          value={artistFilter}
          onChange={(e) => setArtistFilter(e.target.value)}
          aria-label="Filtra per artista"
          containerClassName="w-auto"
        >
          <option value="">Tutti gli artisti</option>
          {artistOptions.map((artist) => (
            <option key={artist} value={artist}>
              {artist}
            </option>
          ))}
        </Select>

        <Select
          value={sourceFilter}
          onChange={(e) =>
            setSourceFilter(
              e.target.value as "all" | "ticketmaster" | "manual"
            )
          }
          aria-label="Filtra per fonte"
          containerClassName="w-auto"
        >
          <option value="all">Tutte le fonti</option>
          <option value="ticketmaster">Ticketmaster</option>
          <option value="manual">Manuale</option>
        </Select>

        <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
          Da
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Data evento da"
            className="w-auto px-2"
          />
        </label>

        <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
          A
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="Data evento a"
            className="w-auto px-2"
          />
        </label>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="link"
            onClick={resetFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancella filtri
          </Button>
        )}
      </div>

      {/* Tab di stato */}

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              "h-auto rounded-xl px-4 py-2",
              filter === item.key
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-accent bg-accent px-5 py-3">
          <span className="text-sm font-semibold text-accent-foreground">
            {selectedIds.size} selezionati
          </span>

          <Button
            type="button"
            onClick={() =>
              setPendingConfirm({ kind: "bulk", status: "published" })
            }
            disabled={bulkBusy}
            className="h-auto rounded-xl px-4 py-2"
          >
            Approva selezionati
          </Button>

          <Button
            type="button"
            onClick={() =>
              setPendingConfirm({ kind: "bulk", status: "rejected" })
            }
            disabled={bulkBusy}
            className="h-auto rounded-xl bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
          >
            Rifiuta selezionati
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setSelectedIds(new Set())}
            disabled={bulkBusy}
            className="h-auto rounded-xl px-4 py-2 text-accent-foreground hover:bg-accent-foreground/10"
          >
            Deseleziona tutto
          </Button>
        </div>
      )}

      {filteredEvents.length === 0 ? (
        <EmptyState
          title="Nessun evento corrisponde ai filtri"
          description="Prova a modificare ricerca o filtri."
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-border"
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

                <th className="sticky right-0 z-10 bg-muted px-6 py-4 text-center shadow-[-6px_0_8px_-4px_rgba(15,23,42,0.12)]">
                  Azioni
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleEvents.map((event) => (
                <tr
                  key={event.id}
                  className="border-t border-border"
                >
                  <td className="px-6 py-5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(event.id)}
                      onChange={() => toggleSelect(event.id)}
                      className="h-4 w-4 rounded border-border"
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
                      <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                        Manuale
                      </span>
                    )}

                    {event.external_id && (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        ID: {event.external_id}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge status={event.status} />
                  </td>

                  <td className="sticky right-0 z-10 bg-card px-6 py-5 shadow-[-6px_0_8px_-4px_rgba(15,23,42,0.12)]">
                    <div className="flex justify-center gap-3">
                      {event.status !== "published" && (
                        <Button
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
                          size="icon-lg"
                          className="rounded-xl"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}

                      {event.status !== "rejected" &&
                        event.status !== "published" && (
                          <Button
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
                            size="icon-lg"
                            className="rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}

                      <Link
                        href={`/admin/events/${event.id}`}
                        title="Modifica"
                        aria-label={`Modifica ${event.title}`}
                        className={cn(
                          buttonVariants({ size: "icon-lg" }),
                          "rounded-xl bg-blue-500 hover:bg-blue-600"
                        )}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>

                      <Button
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
                        size="icon-lg"
                        className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {visibleCount < filteredEvents.length && (
        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setVisibleCount((count) => count + PAGE_SIZE)
            }
            className="h-auto rounded-2xl px-8 py-3"
          >
            Carica altri (
            {filteredEvents.length - visibleCount} rimanenti)
          </Button>
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
      <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
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
      <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
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

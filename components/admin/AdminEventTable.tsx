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
import { StatusBadge } from "@/components/ui/status-badge";
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

type Dict = {
  emptyTitle: string;
  emptyDescription: string;
  searchPlaceholder: string;
  filterCityAria: string;
  filterVenueAria: string;
  filterArtistAria: string;
  filterSourceAria: string;
  filterAllCities: string;
  filterAllVenues: string;
  filterAllArtists: string;
  filterAllSources: string;
  sourceTicketmaster: string;
  sourceManual: string;
  dateFromLabel: string;
  dateToLabel: string;
  dateFromAria: string;
  dateToAria: string;
  clearFilters: string;
  filterAll: string;
  filterImported: string;
  filterPending: string;
  filterPublished: string;
  filterRejected: string;
  selectedCount: string;
  approveSelected: string;
  rejectSelected: string;
  deselectAll: string;
  noMatchTitle: string;
  noMatchDescription: string;
  selectAllAria: string;
  selectRowAria: string;
  colEvent: string;
  colArtist: string;
  colDate: string;
  colCity: string;
  colVenue: string;
  colSource: string;
  colStatus: string;
  colActions: string;
  idLabel: string;
  approveAndPublish: string;
  reject: string;
  edit: string;
  deleteAction: string;
  loadMore: string;
  statusPublished: string;
  statusCancelled: string;
  statusRejected: string;
  statusPending: string;
  confirmDeleteTitle: string;
  confirmDeleteDescription: string;
  confirmBulkPublishTitle: string;
  confirmBulkPublishDescription: string;
  confirmBulkRejectTitle: string;
  confirmBulkRejectDescription: string;
  confirmDeleteButton: string;
  confirmPublishButton: string;
  confirmRejectButton: string;
  operationFailed: string;
  deleteFailed: string;
  contactServerError: string;
  eventsPublishedToast: string;
  eventsRejectedToast: string;
  skippedConcludedNote: string;
  eventDeletedToast: string;
  eventPublishedToast: string;
  eventRejectedToast: string;
};

type Props = {
  events: Event[];
  initialFilter?: string;
  dict: Dict;
  confirmDialogDict: { cancel: string; pleaseWait: string };
};

function isFilter(value: string | undefined): value is Filter {
  return ["all", "imported", "pending", "published", "rejected"].includes(
    value ?? ""
  );
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
  dict,
  confirmDialogDict,
}: Props) {
  const router = useRouter();

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: dict.filterAll },
    { key: "imported", label: dict.filterImported },
    { key: "pending", label: dict.filterPending },
    { key: "published", label: dict.filterPublished },
    { key: "rejected", label: dict.filterRejected },
  ];

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
        toast.error(data.error ?? dict.operationFailed);
        return;
      }

      const skippedNote =
        data.skippedConcluded > 0
          ? dict.skippedConcludedNote.replace(
              "{count}",
              String(data.skippedConcluded)
            )
          : "";

      toast.success(
        (status === "published"
          ? dict.eventsPublishedToast.replace(
              "{count}",
              String(data.updated)
            )
          : dict.eventsRejectedToast.replace(
              "{count}",
              String(data.updated)
            )) + skippedNote
      );

      setSelectedIds(new Set());
      router.refresh();
    } catch {
      toast.error(dict.contactServerError);
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
        toast.error(data.error ?? dict.deleteFailed);
        return;
      }

      toast.success(dict.eventDeletedToast);
      router.refresh();
    } catch {
      toast.error(dict.contactServerError);
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
        toast.error(data.error ?? dict.operationFailed);
        return;
      }

      toast.success(
        status === "published"
          ? dict.eventPublishedToast.replace("{title}", title)
          : dict.eventRejectedToast.replace("{title}", title)
      );

      router.refresh();
    } catch {
      toast.error(dict.contactServerError);
    } finally {
      setBusyId(null);
    }
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title={dict.emptyTitle}
        description={dict.emptyDescription}
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
          placeholder={dict.searchPlaceholder}
          className="h-12 pl-11"
        />
      </div>

      {/* Filtri */}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          aria-label={dict.filterCityAria}
          containerClassName="w-auto"
        >
          <option value="">{dict.filterAllCities}</option>
          {cityOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>

        <Select
          value={venueFilter}
          onChange={(e) => setVenueFilter(e.target.value)}
          aria-label={dict.filterVenueAria}
          containerClassName="w-auto"
        >
          <option value="">{dict.filterAllVenues}</option>
          {venueOptions.map((venue) => (
            <option key={venue} value={venue}>
              {venue}
            </option>
          ))}
        </Select>

        <Select
          value={artistFilter}
          onChange={(e) => setArtistFilter(e.target.value)}
          aria-label={dict.filterArtistAria}
          containerClassName="w-auto"
        >
          <option value="">{dict.filterAllArtists}</option>
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
          aria-label={dict.filterSourceAria}
          containerClassName="w-auto"
        >
          <option value="all">{dict.filterAllSources}</option>
          <option value="ticketmaster">{dict.sourceTicketmaster}</option>
          <option value="manual">{dict.sourceManual}</option>
        </Select>

        <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {dict.dateFromLabel}
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label={dict.dateFromAria}
            className="w-auto px-2"
          />
        </label>

        <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {dict.dateToLabel}
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label={dict.dateToAria}
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
            {dict.clearFilters}
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
            {dict.selectedCount.replace("{count}", String(selectedIds.size))}
          </span>

          <Button
            type="button"
            onClick={() =>
              setPendingConfirm({ kind: "bulk", status: "published" })
            }
            disabled={bulkBusy}
            className="h-auto rounded-xl px-4 py-2"
          >
            {dict.approveSelected}
          </Button>

          <Button
            type="button"
            onClick={() =>
              setPendingConfirm({ kind: "bulk", status: "rejected" })
            }
            disabled={bulkBusy}
            className="h-auto rounded-xl bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
          >
            {dict.rejectSelected}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setSelectedIds(new Set())}
            disabled={bulkBusy}
            className="h-auto rounded-xl px-4 py-2 text-accent-foreground hover:bg-accent-foreground/10"
          >
            {dict.deselectAll}
          </Button>
        </div>
      )}

      {filteredEvents.length === 0 ? (
        <EmptyState
          title={dict.noMatchTitle}
          description={dict.noMatchDescription}
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
                    aria-label={dict.selectAllAria}
                  />
                </th>

                <th className="px-6 py-4 text-left">{dict.colEvent}</th>
                <th className="px-6 py-4 text-left">{dict.colArtist}</th>
                <th className="px-6 py-4 text-left">{dict.colDate}</th>
                <th className="px-6 py-4 text-left">{dict.colCity}</th>
                <th className="px-6 py-4 text-left">{dict.colVenue}</th>
                <th className="px-6 py-4 text-left">{dict.colSource}</th>
                <th className="px-6 py-4 text-left">{dict.colStatus}</th>

                <th className="sticky right-0 z-10 bg-muted px-6 py-4 text-center shadow-[-6px_0_8px_-4px_rgba(15,23,42,0.12)]">
                  {dict.colActions}
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
                      aria-label={dict.selectRowAria.replace(
                        "{title}",
                        event.title
                      )}
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
                      <StatusBadge variant="info">
                        {event.source === "ticketmaster"
                          ? dict.sourceTicketmaster
                          : event.source}
                      </StatusBadge>
                    ) : (
                      <StatusBadge variant="neutral">
                        {dict.sourceManual}
                      </StatusBadge>
                    )}

                    {event.external_id && (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {dict.idLabel.replace("{id}", event.external_id)}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <EventStatusBadge status={event.status} dict={dict} />
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
                          title={dict.approveAndPublish}
                          aria-label={`${dict.approveAndPublish} ${event.title}`}
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
                            title={dict.reject}
                            aria-label={`${dict.reject} ${event.title}`}
                            size="icon-lg"
                            className="rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}

                      <Link
                        href={`/admin/events/${event.id}`}
                        title={dict.edit}
                        aria-label={`${dict.edit} ${event.title}`}
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
                        title={dict.deleteAction}
                        aria-label={`${dict.deleteAction} ${event.title}`}
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
            {dict.loadMore.replace(
              "{count}",
              String(filteredEvents.length - visibleCount)
            )}
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
            ? dict.confirmDeleteTitle
            : pendingConfirm?.status === "published"
              ? dict.confirmBulkPublishTitle
              : dict.confirmBulkRejectTitle
        }
        description={
          pendingConfirm?.kind === "delete"
            ? dict.confirmDeleteDescription.replace(
                "{title}",
                pendingConfirm.title
              )
            : pendingConfirm?.status === "published"
              ? dict.confirmBulkPublishDescription.replace(
                  "{count}",
                  String(selectedIds.size)
                )
              : dict.confirmBulkRejectDescription.replace(
                  "{count}",
                  String(selectedIds.size)
                )
        }
        confirmLabel={
          pendingConfirm?.kind === "delete"
            ? dict.confirmDeleteButton
            : pendingConfirm?.status === "published"
              ? dict.confirmPublishButton
              : dict.confirmRejectButton
        }
        cancelLabel={confirmDialogDict.cancel}
        pleaseWaitLabel={confirmDialogDict.pleaseWait}
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

function EventStatusBadge({
  status,
  dict,
}: {
  status: string;
  dict: {
    statusPublished: string;
    statusCancelled: string;
    statusRejected: string;
    statusPending: string;
  };
}) {
  if (status === "published") {
    return (
      <StatusBadge variant="success">{dict.statusPublished}</StatusBadge>
    );
  }

  if (status === "cancelled") {
    return (
      <StatusBadge variant="danger">{dict.statusCancelled}</StatusBadge>
    );
  }

  if (status === "rejected") {
    return (
      <StatusBadge variant="neutral">{dict.statusRejected}</StatusBadge>
    );
  }

  return <StatusBadge variant="warning">{dict.statusPending}</StatusBadge>;
}

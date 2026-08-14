"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  CheckCircle2,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

type Event = {
  id: string;
  title: string;
  artist: string;
  city: string;
  venue: string;
  category: string;
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

export default function AdminEventTable({
  events,
  initialFilter,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [filter, setFilter] = useState<Filter>(
    isFilter(initialFilter) ? initialFilter : "all"
  );
  const [busyId, setBusyId] = useState<
    string | null
  >(null);
  const [selectedIds, setSelectedIds] = useState<
    Set<string>
  >(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [visibleCount, setVisibleCount] =
    useState(PAGE_SIZE);

  const filteredEvents = useMemo(() => {
    if (filter === "imported") {
      return events.filter((event) => !!event.source);
    }

    if (filter === "pending") {
      return events.filter(
        (event) => event.status === "draft"
      );
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

    return events;
  }, [events, filter]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter]);

  const visibleEvents = filteredEvents.slice(
    0,
    visibleCount
  );

  const allFilteredSelected =
    filteredEvents.length > 0 &&
    filteredEvents.every((event) =>
      selectedIds.has(event.id)
    );

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

        filteredEvents.forEach((event) =>
          next.delete(event.id)
        );

        return next;
      }

      const next = new Set(prev);

      filteredEvents.forEach((event) =>
        next.add(event.id)
      );

      return next;
    });
  }

  async function bulkUpdateStatus(
    status: "published" | "rejected"
  ) {
    const ids = Array.from(selectedIds);

    if (ids.length === 0) return;

    setBulkBusy(true);

    const { error } = await supabase
      .from("events")
      .update({ status })
      .in("id", ids);

    setBulkBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      status === "published"
        ? `${ids.length} eventi pubblicati!`
        : `${ids.length} eventi rifiutati.`
    );

    setSelectedIds(new Set());
    router.refresh();
  }

  async function deleteEvent(id: string, title: string) {
    const confirmed = window.confirm(
      `Vuoi eliminare "${title}"?\n\nQuesta operazione è irreversibile. Se vuoi solo scartarlo mantenendo la cronologia, usa "Rifiuta" invece.`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Evento eliminato!");

    router.refresh();
  }

  async function updateStatus(
    id: string,
    title: string,
    status: "published" | "rejected"
  ) {
    setBusyId(id);

    const { error } = await supabase
      .from("events")
      .update({ status })
      .eq("id", id);

    setBusyId(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      status === "published"
        ? `"${title}" pubblicato!`
        : `"${title}" rifiutato.`
    );

    router.refresh();
  }

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <h2 className="text-2xl font-bold">
          Nessun evento
        </h2>

        <p className="mt-2 text-slate-500">
          Crea il primo evento dal pulsante in alto.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filtri */}

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
            onClick={() => bulkUpdateStatus("published")}
            disabled={bulkBusy}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Approva selezionati
          </button>

          <button
            type="button"
            onClick={() => bulkUpdateStatus("rejected")}
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

              <th className="px-6 py-4 text-left">
                Titolo
              </th>

              <th className="px-6 py-4 text-left">
                Artista
              </th>

              <th className="px-6 py-4 text-left">
                Città
              </th>

              <th className="px-6 py-4 text-left">
                Data
              </th>

              <th className="px-6 py-4 text-left">
                Fonte
              </th>

              <th className="px-6 py-4 text-left">
                Importato il
              </th>

              <th className="px-6 py-4 text-left">
                Stato
              </th>

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

                <td className="px-6 py-5">
                  {event.artist}
                </td>

                <td className="px-6 py-5">
                  {event.city}
                </td>

                <td className="px-6 py-5">
                  {new Date(
                    event.event_date
                  ).toLocaleDateString("it-IT")}
                </td>

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

                <td className="px-6 py-5 text-sm text-slate-500">
                  {event.imported_at
                    ? new Date(
                        event.imported_at
                      ).toLocaleString("it-IT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
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
                          className="rounded-xl bg-amber-500 p-3 text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}

                    <Link
                      href={`/admin/events/${event.id}`}
                      className="rounded-xl bg-blue-500 p-3 text-white transition hover:bg-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>

                    <button
                      onClick={() =>
                        deleteEvent(event.id, event.title)
                      }
                      className="rounded-xl bg-red-500 p-3 text-white transition hover:bg-red-600"
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

      {visibleCount < filteredEvents.length && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount(
                (count) => count + PAGE_SIZE
              )
            }
            className="rounded-2xl border border-slate-200 bg-white px-8 py-3 font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            Carica altri (
            {filteredEvents.length - visibleCount}{" "}
            rimanenti)
          </button>
        </div>
      )}
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

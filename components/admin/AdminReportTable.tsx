"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { toast } from "sonner";

import AdminNoteDialog from "./AdminNoteDialog";

type Report = {
  id: string;
  category: string;
  description: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  reporterName: string;
  reportedName: string | null;
  hasRideRef: boolean;
  hasBookingRef: boolean;
};

type Filter = "all" | "open" | "reviewing" | "resolved" | "dismissed";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tutte" },
  { key: "open", label: "Aperte" },
  { key: "reviewing", label: "In revisione" },
  { key: "resolved", label: "Risolte" },
  { key: "dismissed", label: "Archiviate" },
];

const CATEGORY_LABELS: Record<string, string> = {
  user_behavior: "Comportamento utente",
  inappropriate_content: "Contenuto inappropriato",
  technical_issue: "Problema tecnico",
  safety: "Sicurezza",
  no_show: "Mancata presentazione",
  other: "Altro",
};

export default function AdminReportTable({
  reports,
}: {
  reports: Report[];
}) {
  const router = useRouter();

  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteDialog, setNoteDialog] = useState<{
    id: string;
    status: "resolved" | "dismissed";
  } | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return reports;
    return reports.filter((r) => r.status === filter);
  }, [reports, filter]);

  async function updateStatus(
    id: string,
    status: "reviewing" | "resolved" | "dismissed",
    adminNote?: string
  ) {
    setBusyId(id);

    try {
      const response = await fetch(`/api/admin/reports/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Operazione fallita.");
        return;
      }

      toast.success("Segnalazione aggiornata.");
      router.refresh();
    } catch {
      toast.error("Impossibile contattare il server.");
    } finally {
      setBusyId(null);
      setNoteDialog(null);
    }
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <h2 className="text-2xl font-bold">Nessuna segnalazione</h2>

        <p className="mt-2 text-slate-500">
          Le segnalazioni inviate dagli utenti appariranno qui.
        </p>
      </div>
    );
  }

  return (
    <div>
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

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <h2 className="text-xl font-bold">
            Nessuna segnalazione corrisponde al filtro
          </h2>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {CATEGORY_LABELS[r.category] ?? r.category}
                    </span>

                    <StatusBadge status={r.status} />
                  </div>

                  <p className="mt-3 text-sm text-slate-500">
                    Da <strong>{r.reporterName || "—"}</strong>
                    {r.reportedName && (
                      <>
                        {" "}
                        riguardo <strong>{r.reportedName}</strong>
                      </>
                    )}
                    {(r.hasRideRef || r.hasBookingRef) && (
                      <> · con riferimento a un passaggio</>
                    )}
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-slate-800">
                    {r.description}
                  </p>

                  {r.adminNote && (
                    <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      <strong>Nota admin:</strong> {r.adminNote}
                    </p>
                  )}
                </div>

                {(r.status === "open" || r.status === "reviewing") && (
                  <div className="flex shrink-0 gap-3">
                    {r.status === "open" && (
                      <button
                        onClick={() => updateStatus(r.id, "reviewing")}
                        disabled={busyId === r.id}
                        title="Segna in revisione"
                        aria-label="Segna in revisione"
                        className="rounded-xl bg-blue-500 p-3 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Clock3 className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() =>
                        setNoteDialog({ id: r.id, status: "resolved" })
                      }
                      disabled={busyId === r.id}
                      title="Risolvi"
                      aria-label="Risolvi"
                      className="rounded-xl bg-emerald-500 p-3 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() =>
                        setNoteDialog({ id: r.id, status: "dismissed" })
                      }
                      disabled={busyId === r.id}
                      title="Archivia"
                      aria-label="Archivia"
                      className="rounded-xl bg-slate-400 p-3 text-white transition hover:bg-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminNoteDialog
        open={noteDialog !== null}
        onOpenChange={(open) => {
          if (!open) setNoteDialog(null);
        }}
        title={
          noteDialog?.status === "resolved"
            ? "Risolvi segnalazione"
            : "Archivia segnalazione"
        }
        description="La nota (opzionale) verrà inviata come notifica a chi ha segnalato."
        noteLabel="Nota per l'utente"
        confirmLabel={
          noteDialog?.status === "resolved" ? "Risolvi" : "Archivia"
        }
        cancelLabel="Annulla"
        confirmTone={
          noteDialog?.status === "resolved" ? "default" : "warning"
        }
        busy={busyId === noteDialog?.id}
        onConfirm={(note) => {
          if (noteDialog) {
            updateStatus(noteDialog.id, noteDialog.status, note);
          }
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "resolved") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        Risolta
      </span>
    );
  }

  if (status === "dismissed") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
        Archiviata
      </span>
    );
  }

  if (status === "reviewing") {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        In revisione
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
      Aperta
    </span>
  );
}

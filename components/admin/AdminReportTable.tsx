"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { toast } from "sonner";

import AdminNoteDialog from "./AdminNoteDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

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
      <EmptyState
        title="Nessuna segnalazione"
        description="Le segnalazioni inviate dagli utenti appariranno qui."
      />
    );
  }

  return (
    <div>
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

      {filtered.length === 0 ? (
        <EmptyState
          title="Nessuna segnalazione corrisponde al filtro"
          description=""
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <Card key={r.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                      {CATEGORY_LABELS[r.category] ?? r.category}
                    </span>

                    <StatusBadge status={r.status} />
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
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

                  <p className="mt-3 whitespace-pre-wrap text-foreground">
                    {r.description}
                  </p>

                  {r.adminNote && (
                    <p className="mt-3 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                      <strong>Nota admin:</strong> {r.adminNote}
                    </p>
                  )}
                </div>

                {(r.status === "open" || r.status === "reviewing") && (
                  <div className="flex shrink-0 gap-3">
                    {r.status === "open" && (
                      <Button
                        onClick={() => updateStatus(r.id, "reviewing")}
                        disabled={busyId === r.id}
                        title="Segna in revisione"
                        aria-label="Segna in revisione"
                        size="icon-lg"
                        className="rounded-xl bg-blue-500 text-white hover:bg-blue-600"
                      >
                        <Clock3 className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      onClick={() =>
                        setNoteDialog({ id: r.id, status: "resolved" })
                      }
                      disabled={busyId === r.id}
                      title="Risolvi"
                      aria-label="Risolvi"
                      size="icon-lg"
                      className="rounded-xl"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>

                    <Button
                      onClick={() =>
                        setNoteDialog({ id: r.id, status: "dismissed" })
                      }
                      disabled={busyId === r.id}
                      title="Archivia"
                      aria-label="Archivia"
                      size="icon-lg"
                      className="rounded-xl bg-slate-400 text-white hover:bg-slate-500"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
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
      <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
        Risolta
      </span>
    );
  }

  if (status === "dismissed") {
    return (
      <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
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

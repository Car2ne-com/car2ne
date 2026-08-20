"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { toast } from "sonner";

import AdminNoteDialog from "./AdminNoteDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

type Verification = {
  id: string;
  driverName: string;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlate: string;
  licenseNumber: string;
  hasDocument: boolean;
  status: string;
  adminNote: string | null;
  createdAt: string;
};

type Filter = "all" | "pending" | "approved" | "rejected" | "expired";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tutti" },
  { key: "pending", label: "In attesa" },
  { key: "approved", label: "Approvati" },
  { key: "rejected", label: "Rifiutati" },
  { key: "expired", label: "Scaduti" },
];

export default function AdminVerificationTable({
  verifications,
}: {
  verifications: Verification[];
}) {
  const router = useRouter();

  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(
    null
  );

  const filtered = useMemo(() => {
    if (filter === "all") return verifications;
    return verifications.filter((v) => v.status === filter);
  }, [verifications, filter]);

  async function viewDocument(id: string) {
    setBusyId(id);

    try {
      const response = await fetch(
        `/api/admin/driver-verifications/${id}/document-url`
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Documento non disponibile.");
        return;
      }

      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Impossibile contattare il server.");
    } finally {
      setBusyId(null);
    }
  }

  async function updateStatus(
    id: string,
    status: "approved" | "rejected",
    adminNote?: string
  ) {
    setBusyId(id);

    try {
      const response = await fetch(
        `/api/admin/driver-verifications/${id}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, adminNote }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Operazione fallita.");
        return;
      }

      toast.success(
        status === "approved"
          ? "Conducente verificato!"
          : "Richiesta rifiutata."
      );

      router.refresh();
    } catch {
      toast.error("Impossibile contattare il server.");
    } finally {
      setBusyId(null);
      setRejectTargetId(null);
    }
  }

  if (verifications.length === 0) {
    return (
      <EmptyState
        title="Nessuna richiesta"
        description="Le richieste di verifica conducente appariranno qui."
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
          title="Nessuna richiesta corrisponde al filtro"
          description=""
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left">Conducente</th>
                <th className="px-6 py-4 text-left">Veicolo</th>
                <th className="px-6 py-4 text-left">Targa</th>
                <th className="px-6 py-4 text-left">Patente</th>
                <th className="px-6 py-4 text-left">Stato</th>
                <th className="px-6 py-4 text-center">Azioni</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-t border-border">
                  <td className="px-6 py-5 font-semibold">
                    {v.driverName || "—"}
                  </td>

                  <td className="px-6 py-5">
                    {v.vehicleMake} {v.vehicleModel}
                  </td>

                  <td className="px-6 py-5">{v.vehiclePlate}</td>
                  <td className="px-6 py-5">{v.licenseNumber}</td>

                  <td className="px-6 py-5">
                    <StatusBadge status={v.status} />

                    {v.adminNote && v.status === "rejected" && (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {v.adminNote}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-3">
                      {v.hasDocument && (
                        <Button
                          onClick={() => viewDocument(v.id)}
                          disabled={busyId === v.id}
                          title="Visualizza documento"
                          aria-label={`Visualizza documento di ${v.driverName}`}
                          size="icon-lg"
                          className="rounded-xl bg-blue-500 text-white hover:bg-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      {v.status === "pending" && (
                        <>
                          <Button
                            onClick={() => updateStatus(v.id, "approved")}
                            disabled={busyId === v.id}
                            title="Approva"
                            aria-label={`Approva ${v.driverName}`}
                            size="icon-lg"
                            className="rounded-xl"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>

                          <Button
                            onClick={() => setRejectTargetId(v.id)}
                            disabled={busyId === v.id}
                            title="Rifiuta"
                            aria-label={`Rifiuta ${v.driverName}`}
                            size="icon-lg"
                            className="rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <AdminNoteDialog
        open={rejectTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setRejectTargetId(null);
        }}
        title="Rifiuta richiesta"
        description="Spiega al conducente perché la richiesta non è stata approvata."
        noteLabel="Motivazione"
        noteRequired
        confirmLabel="Rifiuta"
        cancelLabel="Annulla"
        confirmTone="danger"
        busy={busyId === rejectTargetId}
        onConfirm={(note) => {
          if (rejectTargetId) {
            updateStatus(rejectTargetId, "rejected", note);
          }
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
        Approvato
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Rifiutato
      </span>
    );
  }

  if (status === "expired") {
    return (
      <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
        Scaduto
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
      In attesa
    </span>
  );
}

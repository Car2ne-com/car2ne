"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { toast } from "sonner";

import AdminNoteDialog from "./AdminNoteDialog";

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
      <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <h2 className="text-2xl font-bold">Nessuna richiesta</h2>

        <p className="mt-2 text-slate-500">
          Le richieste di verifica conducente appariranno qui.
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
            Nessuna richiesta corrisponde al filtro
          </h2>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50">
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
                <tr key={v.id} className="border-t border-slate-100">
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
                      <p className="mt-1 text-[11px] text-slate-400">
                        {v.adminNote}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-3">
                      {v.hasDocument && (
                        <button
                          onClick={() => viewDocument(v.id)}
                          disabled={busyId === v.id}
                          title="Visualizza documento"
                          aria-label={`Visualizza documento di ${v.driverName}`}
                          className="rounded-xl bg-blue-500 p-3 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}

                      {v.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(v.id, "approved")}
                            disabled={busyId === v.id}
                            title="Approva"
                            aria-label={`Approva ${v.driverName}`}
                            className="rounded-xl bg-emerald-500 p-3 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setRejectTargetId(v.id)}
                            disabled={busyId === v.id}
                            title="Rifiuta"
                            aria-label={`Rifiuta ${v.driverName}`}
                            className="rounded-xl bg-amber-500 p-3 text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
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
      <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
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

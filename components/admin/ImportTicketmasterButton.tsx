"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

type ImportResult = {
  eventsFetched: number;
  eventsCreated: number;
  eventsUpdated: number;
  eventsSkipped: number;
  eventsFailed: number;
  errorMessage: string | null;
};

export default function ImportTicketmasterButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleImport() {
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/import/ticketmaster",
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.error ??
            "Importazione fallita."
        );
        return;
      }

      const result = data as ImportResult;

      if (result.errorMessage) {
        toast.error(result.errorMessage);
      } else {
        toast.success(
          `Importazione completata: ${result.eventsCreated} creati, ` +
            `${result.eventsUpdated} aggiornati, ` +
            `${result.eventsSkipped} invariati.`
        );
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Errore importazione Ticketmaster:",
        error
      );

      toast.error(
        "Impossibile contattare il server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleImport}
      disabled={loading}
      className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <RefreshCw
        className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
      />
      {loading
        ? "Importazione..."
        : "Importa da Ticketmaster"}
    </button>
  );
}

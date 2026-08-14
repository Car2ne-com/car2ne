"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music2 } from "lucide-react";
import { toast } from "sonner";

type BackfillResult = {
  eventsFound: number;
  eventsUpdated: number;
  eventsFailed: number;
};

export default function BackfillArtistSlugButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleBackfill() {
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/backfill-artist-slug",
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.error ?? "Backfill fallito."
        );
        return;
      }

      const result = data as BackfillResult;

      toast.success(
        `Slug artisti collegati: ${result.eventsUpdated}/${result.eventsFound}` +
          (result.eventsFailed > 0
            ? ` (${result.eventsFailed} falliti, vedi log)`
            : ".")
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Errore backfill artist_slug:",
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
      onClick={handleBackfill}
      disabled={loading}
      className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Music2
        className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`}
      />
      {loading
        ? "Collegamento..."
        : "Collega slug artisti mancanti"}
    </button>
  );
}

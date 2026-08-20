"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { IMPORT_COOLDOWN_MS } from "@/lib/importers/cooldown";
import { Button } from "@/components/ui/button";

type ImportResult = {
  eventsFetched: number;
  eventsCreated: number;
  eventsUpdated: number;
  eventsSkipped: number;
  eventsFailed: number;
  errorMessage: string | null;
};

type Props = {
  initialCooldownRemainingMs: number;
};

function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function ImportTicketmasterButton({
  initialCooldownRemainingMs,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(
    initialCooldownRemainingMs
  );

  /*
   * Il countdown è solo visualizzazione: serve a disabilitare il
   * pulsante e spiegare perché, non è l'enforcement del cooldown
   * (quello resta esclusivamente lato API, unica fonte di verità).
   */
  useEffect(() => {
    if (cooldownRemainingMs <= 0) return;

    const interval = setInterval(() => {
      setCooldownRemainingMs((current) =>
        Math.max(0, current - 1000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownRemainingMs]);

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
          data.error ?? "Importazione fallita."
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

      // Disabilita subito il pulsante per il nuovo cooldown, in
      // attesa che il refresh porti il valore reale dal server.
      setCooldownRemainingMs(IMPORT_COOLDOWN_MS);

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

  const onCooldown = cooldownRemainingMs > 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleImport}
        disabled={loading || onCooldown}
        title={
          onCooldown
            ? `Disponibile tra ${formatRemaining(cooldownRemainingMs)}: evita importazioni ravvicinate inutili.`
            : undefined
        }
        className="h-auto gap-2 rounded-2xl px-6 py-3"
      >
        <RefreshCw
          className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
        />
        {loading
          ? "Import in corso..."
          : onCooldown
            ? `Disponibile tra ${formatRemaining(cooldownRemainingMs)}`
            : "Importa da Ticketmaster"}
      </Button>

      {onCooldown && !loading && (
        <p className="text-sm text-muted-foreground">
          In cooldown: evita importazioni ravvicinate inutili.
        </p>
      )}

      <Link
        href="/admin/events?filter=pending"
        className="text-sm font-semibold text-primary hover:underline"
      >
        Rivedi eventi in attesa →
      </Link>
    </div>
  );
}

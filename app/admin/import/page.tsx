import Link from "next/link";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getCooldownRemainingMs } from "@/lib/importers/cooldown";
import ImportTicketmasterButton from "@/components/admin/ImportTicketmasterButton";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImportLog = {
  id: string;
  status: string;
  events_created: number;
  events_updated: number;
  events_skipped: number;
  events_failed: number;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
};

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminImportPage({
  searchParams,
}: Props) {
  const { supabase } = await requireAdmin();

  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  /*
   * Due letture separate: "ultimo import" deve restare quello vero
   * (l'ultima riga in assoluto) a prescindere da quale pagina dello
   * storico si sta guardando, quindi non può essere derivato dalla
   * query paginata quando currentPage > 1.
   */
  const [lastImportResult, historyResult] = await Promise.all([
    supabase
      .from("import_logs")
      .select("*")
      .eq("source", "ticketmaster")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("import_logs")
      .select("*", { count: "exact" })
      .eq("source", "ticketmaster")
      .order("started_at", { ascending: false })
      .range(from, to),
  ]);

  const lastImport = lastImportResult.data as ImportLog | null;
  const history = (historyResult.data ?? []) as ImportLog[];
  const totalPages = Math.max(
    1,
    Math.ceil((historyResult.count ?? 0) / PAGE_SIZE)
  );

  const cooldownRemainingMs = getCooldownRemainingMs(
    lastImport?.started_at ?? null
  );

  return (
    <main className="mx-auto max-w-7xl p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Import
        </h1>

        <p className="mt-2 text-muted-foreground">
          Importa eventi dalle fonti esterne collegate a Car2ne.
        </p>
      </div>

      <Card className="p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Ticketmaster
            </h2>

            <p className="mt-2 text-muted-foreground">
              Avvia manualmente l&apos;importazione degli eventi da
              Ticketmaster. Gli eventi importati entrano in stato
              &quot;In attesa&quot; e vanno revisionati da{" "}
              <span className="font-semibold">Eventi</span>.
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <p className="text-sm font-semibold text-muted-foreground">
            Ultimo import
          </p>

          {!lastImport ? (
            <p className="mt-2 text-muted-foreground">
              Non è stato ancora eseguito alcun import.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-2">
              <Stat
                label="Data"
                value={new Date(
                  lastImport.finished_at ?? lastImport.started_at
                ).toLocaleString("it-IT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />

              <Stat
                label="Stato"
                value={<StatusBadge status={lastImport.status} />}
              />

              <Stat
                label="Creati"
                value={lastImport.events_created}
              />

              <Stat
                label="Aggiornati"
                value={lastImport.events_updated}
              />

              <Stat
                label="Falliti"
                value={lastImport.events_failed}
                tone={
                  lastImport.events_failed > 0 ? "bad" : undefined
                }
              />
            </div>
          )}

          {lastImport?.status === "failed" && (
            <div className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3">
              <p className="text-sm font-semibold text-destructive">
                L&apos;ultimo import è fallito.
              </p>

              {lastImport.error_message && (
                <ErrorMessage message={lastImport.error_message} />
              )}
            </div>
          )}

          {lastImport?.status === "success" &&
            lastImport.events_failed > 0 && (
              <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3">
                <p className="text-sm font-semibold text-amber-700">
                  Import concluso con {lastImport.events_failed}{" "}
                  {lastImport.events_failed === 1
                    ? "evento non importato"
                    : "eventi non importati"}{" "}
                  (dettagli nei log server).
                </p>
              </div>
            )}
        </div>

        <div className="mt-6">
          <ImportTicketmasterButton
            initialCooldownRemainingMs={cooldownRemainingMs}
          />
        </div>
      </Card>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Storico import
        </h2>

        {history.length === 0 ? (
          <EmptyState
            title="Nessuno storico"
            description="Non è stato ancora eseguito alcun import."
          />
        ) : (
          <>
            <Card className="overflow-x-auto p-0">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      Data/ora
                    </th>
                    <th className="px-6 py-4 text-left">Stato</th>
                    <th className="px-6 py-4 text-left">Creati</th>
                    <th className="px-6 py-4 text-left">
                      Aggiornati
                    </th>
                    <th className="px-6 py-4 text-left">Falliti</th>
                    <th className="px-6 py-4 text-left">Durata</th>
                    <th className="px-6 py-4 text-left">Errore</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((log) => (
                    <tr
                      key={log.id}
                      className="border-t border-border align-top"
                    >
                      <td className="px-6 py-5 text-sm text-foreground/90">
                        {new Date(
                          log.started_at
                        ).toLocaleString("it-IT", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge status={log.status} />
                      </td>

                      <td className="px-6 py-5 font-semibold text-foreground">
                        {log.events_created}
                      </td>

                      <td className="px-6 py-5 font-semibold text-foreground">
                        {log.events_updated}
                      </td>

                      <td
                        className={`px-6 py-5 font-semibold ${
                          log.events_failed > 0
                            ? "text-destructive"
                            : "text-foreground"
                        }`}
                      >
                        {log.events_failed}
                      </td>

                      <td className="px-6 py-5 text-sm text-muted-foreground">
                        {formatDuration(
                          log.started_at,
                          log.finished_at
                        )}
                      </td>

                      <td className="px-6 py-5 text-sm">
                        {log.error_message ? (
                          <ErrorMessage
                            message={log.error_message}
                          />
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-4">
                {currentPage > 1 ? (
                  <Link
                    href={
                      currentPage - 1 === 1
                        ? "/admin/import"
                        : `/admin/import?page=${currentPage - 1}`
                    }
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-auto rounded-xl px-4 py-2"
                    )}
                  >
                    Precedente
                  </Link>
                ) : (
                  <span className="rounded-xl border border-border/60 px-4 py-2 text-sm font-semibold text-muted-foreground/50">
                    Precedente
                  </span>
                )}

                <span className="text-sm text-muted-foreground">
                  Pagina {currentPage} di {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={`/admin/import?page=${currentPage + 1}`}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-auto rounded-xl px-4 py-2"
                    )}
                  >
                    Successiva
                  </Link>
                ) : (
                  <span className="rounded-xl border border-border/60 px-4 py-2 text-sm font-semibold text-muted-foreground/50">
                    Successiva
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "bad";
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground/70">{label}</p>
      <p
        className={`text-lg font-bold ${
          tone === "bad" ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/*
 * Valori realmente ammessi da import_logs.status (vincolo CHECK in
 * 0004_ticketmaster_import.sql): solo running / success / failed.
 * Nessuno stato inventato.
 */
function StatusBadge({ status }: { status: string }) {
  if (status === "success") {
    return (
      <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
        Riuscito
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Fallito
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
      In corso
    </span>
  );
}

function formatDuration(
  startedAt: string,
  finishedAt: string | null
): string {
  if (!finishedAt) {
    return "—";
  }

  const ms =
    new Date(finishedAt).getTime() - new Date(startedAt).getTime();

  if (ms < 0) {
    return "—";
  }

  const totalSeconds = Math.round(ms / 1000);

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${seconds}s`;
}

const ERROR_PREVIEW_LENGTH = 100;

function ErrorMessage({ message }: { message: string }) {
  if (message.length <= ERROR_PREVIEW_LENGTH) {
    return <p className="text-destructive">{message}</p>;
  }

  return (
    <details className="text-destructive">
      <summary className="cursor-pointer font-medium">
        {message.slice(0, ERROR_PREVIEW_LENGTH)}…
      </summary>

      <p className="mt-2 whitespace-pre-wrap">{message}</p>
    </details>
  );
}

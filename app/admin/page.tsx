import Link from "next/link";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEventConcluded } from "@/lib/utils/eventStatus";
import { romeDay } from "@/lib/utils/date";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();
  const adminClient = createAdminClient();

  const now = new Date();
  const today = romeDay(now);
  const sevenDaysAgoIso = new Date(
    now.getTime() - SEVEN_DAYS_MS
  ).toISOString();

  /*
   * Query indipendenti in parallelo. events/import_logs restano sul
   * client normale (stesso pattern già in uso in /admin/events e nel
   * cooldown import — RLS già verificata lì). profiles/rides/bookings
   * passano dal client service-role: quelle tabelle non sono nelle
   * migration versionate quindi non è verificabile da codice che le
   * loro RLS diano visibilità globale a un admin (a differenza di
   * import_logs, che ha una policy "admin can read" esplicita). Stesso
   * approccio già usato in /admin/users per lo stesso identico motivo.
   */
  const [
    eventsResult,
    lastImportResult,
    ridesActiveResult,
    bookingsTotalResult,
    bookingsPendingResult,
    bookingsConfirmedResult,
    profilesTotalResult,
    profilesNewResult,
  ] = await Promise.all([
    supabase
      .from("events")
      .select("event_date, status, city_id, venue_id"),

    supabase
      .from("import_logs")
      .select("*")
      .eq("source", "ticketmaster")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    adminClient
      .from("rides")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),

    adminClient
      .from("bookings")
      .select("id", { count: "exact", head: true }),

    adminClient
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    adminClient
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed"),

    adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true }),

    adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgoIso),
  ]);

  /*
   * KPI eventi + data quality dalla stessa lettura: una sola query
   * stretta (4 colonne, non select "*") invece di N query aggregate
   * separate — a questa scala (poche centinaia di righe) è più
   * economico di 8 round-trip di rete, e permette di riusare
   * esattamente la stessa regola isEventConcluded() già in
   * produzione (non traducibile in modo affidabile in un singolo
   * confronto SQL senza rischiare di scostarsi dalla regola reale).
   */
  const eventRows = eventsResult.data ?? [];
  const eventsError = eventsResult.error;

  const eventsTotal = eventRows.length;
  const eventsConcluded = eventRows.filter((e) =>
    isEventConcluded(e.event_date, now)
  ).length;
  const eventsOperational = eventsTotal - eventsConcluded;
  const eventsPublished = eventRows.filter(
    (e) => e.status === "published"
  ).length;
  const eventsPending = eventRows.filter(
    (e) => e.status === "draft"
  ).length;
  const eventsRejected = eventRows.filter(
    (e) => e.status === "rejected"
  ).length;
  const eventsFuture = eventRows.filter(
    (e) => new Date(e.event_date) > now
  ).length;
  const eventsToday = eventRows.filter(
    (e) => romeDay(new Date(e.event_date)) === today
  ).length;
  const eventsNoCity = eventRows.filter((e) => !e.city_id).length;
  const eventsNoVenue = eventRows.filter((e) => !e.venue_id).length;

  const lastImport = lastImportResult.data;

  return (
    <main className="mx-auto max-w-7xl p-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Panoramica del servizio e delle attività recenti.
        </p>
      </div>

      {/* KPI principali */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiTile
          label="Eventi operativi"
          value={
            eventsError ? null : eventsOperational
          }
          caption={
            eventsError
              ? "Dato non disponibile"
              : `${eventsTotal} totali · ${eventsConcluded} conclusi`
          }
        />

        <KpiTile
          label="Utenti"
          value={profilesTotalResult.count}
          caption={
            profilesNewResult.count !== null
              ? `+${profilesNewResult.count} ultimi 7gg`
              : undefined
          }
        />

        <KpiTile
          label="Ride attive"
          value={ridesActiveResult.count}
        />

        <KpiTile
          label="Prenotazioni"
          value={bookingsTotalResult.count}
        />
      </div>

      {/* Eventi + Carpooling */}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Eventi">
          <StatRow
            label="Operativi"
            value={eventsError ? null : eventsOperational}
          />
          <StatRow
            label="Pubblicati"
            value={eventsError ? null : eventsPublished}
          />
          <StatRow
            label="In attesa"
            value={eventsError ? null : eventsPending}
          />
          <StatRow
            label="Rifiutati"
            value={eventsError ? null : eventsRejected}
          />
          <StatRow
            label="Futuri"
            value={eventsError ? null : eventsFuture}
          />
          <StatRow
            label="Oggi"
            value={eventsError ? null : eventsToday}
          />
          <StatRow
            label="Conclusi (storico)"
            value={eventsError ? null : eventsConcluded}
            muted
          />
        </SectionCard>

        <SectionCard title="Carpooling">
          <StatRow
            label="Ride attive"
            value={ridesActiveResult.count}
          />
          <StatRow
            label="Prenotazioni totali"
            value={bookingsTotalResult.count}
          />
          <StatRow
            label="Richieste pendenti"
            value={bookingsPendingResult.count}
          />
          <StatRow
            label="Prenotazioni confermate"
            value={bookingsConfirmedResult.count}
          />
        </SectionCard>
      </div>

      {/* Import + Data quality */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Import Ticketmaster"
          footer={
            <Link
              href="/admin/import"
              className="text-sm font-semibold text-emerald-700 hover:underline"
            >
              Vai agli import →
            </Link>
          }
        >
          {lastImportResult.error ? (
            <p className="text-sm text-slate-500">
              Dato non disponibile.
            </p>
          ) : !lastImport ? (
            <p className="text-sm text-slate-500">
              Nessun import eseguito finora.
            </p>
          ) : (
            <>
              <StatRow
                label="Ultimo import"
                value={new Date(
                  lastImport.finished_at ??
                    lastImport.started_at
                ).toLocaleString("it-IT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                isText
              />

              <StatRow
                label="Esito"
                value={
                  lastImport.status === "success"
                    ? "Riuscito"
                    : lastImport.status === "failed"
                      ? "Fallito"
                      : "In corso"
                }
                isText
                tone={
                  lastImport.status === "success"
                    ? "good"
                    : lastImport.status === "failed"
                      ? "bad"
                      : undefined
                }
              />

              <StatRow
                label="Eventi creati"
                value={lastImport.events_created}
              />

              <StatRow
                label="Eventi aggiornati"
                value={lastImport.events_updated}
              />

              {lastImport.events_failed > 0 && (
                <StatRow
                  label="Eventi falliti"
                  value={lastImport.events_failed}
                  tone="bad"
                />
              )}

              {lastImport.error_message && (
                <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                  {lastImport.error_message}
                </p>
              )}
            </>
          )}
        </SectionCard>

        <SectionCard title="Qualità dati">
          {eventsError ? (
            <p className="text-sm text-slate-500">
              Dato non disponibile.
            </p>
          ) : eventsNoCity === 0 && eventsNoVenue === 0 ? (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              Nessuna anomalia rilevata su città/venue.
            </p>
          ) : (
            <>
              <StatRow
                label="Eventi senza città"
                value={eventsNoCity}
                tone={eventsNoCity > 0 ? "bad" : "good"}
              />
              <StatRow
                label="Eventi senza venue"
                value={eventsNoVenue}
                tone={eventsNoVenue > 0 ? "bad" : "good"}
              />
            </>
          )}
        </SectionCard>
      </div>

      {/* Link operativi */}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/events"
          className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Gestisci eventi
        </Link>

        <Link
          href="/admin/users"
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          Gestisci utenti
        </Link>

        <Link
          href="/admin/import"
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          Vai agli import
        </Link>

        <Link
          href="/admin/analytics"
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          Vai ad analytics
        </Link>
      </div>
    </main>
  );
}

function KpiTile({
  label,
  value,
  caption,
}: {
  label: string;
  value: number | null | undefined;
  caption?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-1 text-3xl font-black text-slate-900">
        {value === null || value === undefined ? "—" : value}
      </p>

      {caption && (
        <p className="mt-1 text-xs text-slate-400">{caption}</p>
      )}
    </div>
  );
}

function SectionCard({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>

      <div className="mt-4 space-y-2">{children}</div>

      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}

function StatRow({
  label,
  value,
  muted,
  isText,
  tone,
}: {
  label: string;
  value: number | string | null | undefined;
  muted?: boolean;
  isText?: boolean;
  tone?: "good" | "bad";
}) {
  const displayValue =
    value === null || value === undefined
      ? "—"
      : isText
        ? value
        : value;

  return (
    <div className="flex items-center justify-between text-sm">
      <span
        className={muted ? "text-slate-400" : "text-slate-600"}
      >
        {label}
      </span>

      <span
        className={`font-semibold ${
          tone === "bad"
            ? "text-red-600"
            : tone === "good"
              ? "text-emerald-600"
              : muted
                ? "text-slate-400"
                : "text-slate-900"
        }`}
      >
        {displayValue}
      </span>
    </div>
  );
}

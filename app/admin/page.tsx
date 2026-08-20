import Link from "next/link";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEventConcluded } from "@/lib/utils/eventStatus";
import { romeDay } from "@/lib/utils/date";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();
  const adminClient = createAdminClient();
  const { dict } = await getTranslations();
  const t = dict.admin.dashboardPage;

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
        <h1 className="text-2xl font-bold text-foreground">
          {t.title}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      {/* KPI principali */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiTile
          label={t.kpiOperationalEvents}
          value={
            eventsError ? null : eventsOperational
          }
          caption={
            eventsError
              ? t.dataUnavailable
              : t.totalConcludedCaption
                  .replace("{total}", String(eventsTotal))
                  .replace("{concluded}", String(eventsConcluded))
          }
        />

        <KpiTile
          label={t.kpiUsers}
          value={profilesTotalResult.count}
          caption={
            profilesNewResult.count !== null
              ? t.last7Days.replace(
                  "{count}",
                  String(profilesNewResult.count)
                )
              : undefined
          }
        />

        <KpiTile
          label={t.kpiActiveRides}
          value={ridesActiveResult.count}
        />

        <KpiTile
          label={t.kpiBookings}
          value={bookingsTotalResult.count}
        />
      </div>

      {/* Eventi + Carpooling */}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title={t.eventsSectionTitle}>
          <StatRow
            label={t.statOperational}
            value={eventsError ? null : eventsOperational}
          />
          <StatRow
            label={t.statPublished}
            value={eventsError ? null : eventsPublished}
          />
          <StatRow
            label={t.statPending}
            value={eventsError ? null : eventsPending}
          />
          <StatRow
            label={t.statRejected}
            value={eventsError ? null : eventsRejected}
          />
          <StatRow
            label={t.statFuture}
            value={eventsError ? null : eventsFuture}
          />
          <StatRow
            label={t.statToday}
            value={eventsError ? null : eventsToday}
          />
          <StatRow
            label={t.statConcludedHistory}
            value={eventsError ? null : eventsConcluded}
            muted
          />
        </SectionCard>

        <SectionCard title={t.carpoolingSectionTitle}>
          <StatRow
            label={t.statActiveRides}
            value={ridesActiveResult.count}
          />
          <StatRow
            label={t.statTotalBookings}
            value={bookingsTotalResult.count}
          />
          <StatRow
            label={t.statPendingRequests}
            value={bookingsPendingResult.count}
          />
          <StatRow
            label={t.statConfirmedBookings}
            value={bookingsConfirmedResult.count}
          />
        </SectionCard>
      </div>

      {/* Import + Data quality */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title={t.importSectionTitle}
          footer={
            <Link
              href="/admin/import"
              className="text-sm font-semibold text-primary hover:underline"
            >
              {t.goToImports}
            </Link>
          }
        >
          {lastImportResult.error ? (
            <p className="text-sm text-muted-foreground">
              {t.dataUnavailable}
            </p>
          ) : !lastImport ? (
            <p className="text-sm text-muted-foreground">
              {t.noImportYet}
            </p>
          ) : (
            <>
              <StatRow
                label={t.lastImportLabel}
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
                label={t.outcomeLabel}
                value={
                  lastImport.status === "success"
                    ? t.succeeded
                    : lastImport.status === "failed"
                      ? t.failed
                      : t.inProgress
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
                label={t.eventsCreatedLabel}
                value={lastImport.events_created}
              />

              <StatRow
                label={t.eventsUpdatedLabel}
                value={lastImport.events_updated}
              />

              {lastImport.events_failed > 0 && (
                <StatRow
                  label={t.eventsFailedLabel}
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

        <SectionCard title={t.dataQualitySectionTitle}>
          {eventsError ? (
            <p className="text-sm text-muted-foreground">
              {t.dataUnavailable}
            </p>
          ) : eventsNoCity === 0 && eventsNoVenue === 0 ? (
            <p className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground">
              {t.noAnomalies}
            </p>
          ) : (
            <>
              <StatRow
                label={t.eventsNoCity}
                value={eventsNoCity}
                tone={eventsNoCity > 0 ? "bad" : "good"}
              />
              <StatRow
                label={t.eventsNoVenue}
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
          className={cn(
            buttonVariants(),
            "h-auto rounded-2xl bg-foreground px-6 py-3 text-sm text-background hover:bg-foreground/90"
          )}
        >
          {t.manageEvents}
        </Link>

        <Link
          href="/admin/users"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto rounded-2xl px-6 py-3 text-sm"
          )}
        >
          {t.manageUsers}
        </Link>

        <Link
          href="/admin/import"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto rounded-2xl px-6 py-3 text-sm"
          )}
        >
          {t.goToImports}
        </Link>

        <Link
          href="/admin/analytics"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto rounded-2xl px-6 py-3 text-sm"
          )}
        >
          {t.goToAnalytics}
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
    <Card className="p-5">
      <p className="text-sm text-muted-foreground">{label}</p>

      <p className="mt-1 text-3xl font-black text-foreground">
        {value === null || value === undefined ? "—" : value}
      </p>

      {caption && (
        <p className="mt-1 text-xs text-muted-foreground/70">{caption}</p>
      )}
    </Card>
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
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>

      <div className="mt-4 space-y-2">{children}</div>

      {footer && <div className="mt-4">{footer}</div>}
    </Card>
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
        className={muted ? "text-muted-foreground/70" : "text-muted-foreground"}
      >
        {label}
      </span>

      <span
        className={`font-semibold ${
          tone === "bad"
            ? "text-destructive"
            : tone === "good"
              ? "text-primary"
              : muted
                ? "text-muted-foreground/70"
                : "text-foreground"
        }`}
      >
        {displayValue}
      </span>
    </div>
  );
}

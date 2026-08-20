import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isEventConcluded } from "@/lib/utils/eventStatus";
import AdminEventTable from "@/components/admin/AdminEventTable";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function AdminEventsPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const supabase = await createClient();
  const { dict } = await getTranslations();
  const t = dict.admin.eventsPage;

  // Controlla autenticazione
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Controlla ruolo admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  /*
   * Colonne minime per la tabella operativa: niente
   * description/image_url/raw_payload (pesanti, usati solo dal form
   * di modifica evento, non dalla lista).
   */
  const { data: events, error } = await supabase
    .from("events")
    .select(
      "id, title, artist, city, venue, event_date, status, source, external_id, imported_at"
    )
    .order("event_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  /*
   * Vista operativa: esclude gli eventi già conclusi (stessa regola
   * usata dalla pagina pubblica evento e dai promemoria recensione,
   * vedi lib/utils/eventStatus.ts). I dati restano nel DB invariati
   * — qui si filtra solo cosa arriva alla tabella admin, non la
   * fonte. Vale per tutti gli eventi, importati o manuali: una volta
   * concluso, un evento non è più operativamente gestibile a
   * prescindere da come è stato creato.
   */
  const now = new Date();

  const activeEvents = (events ?? []).filter(
    (event) => !isEventConcluded(event.event_date, now)
  );

  return (
    <main className="mx-auto max-w-7xl p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t.title}
          </h1>

          <p className="mt-2 text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/events/new"
            className={cn(
              buttonVariants(),
              "h-auto rounded-2xl px-6 py-3"
            )}
          >
            {t.newEvent}
          </Link>
        </div>
      </div>

      <AdminEventTable
        key={params.filter ?? "all"}
        events={activeEvents}
        initialFilter={params.filter}
        dict={dict.admin.eventTable}
        confirmDialogDict={dict.admin.confirmDialog}
      />
    </main>
  );
}
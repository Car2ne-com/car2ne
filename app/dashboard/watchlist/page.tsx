import Link from "next/link";
import { redirect } from "next/navigation";

import WatchlistCard from "@/components/dashboard/WatchlistCard";
import { EmptyState } from "@/components/ui/empty-state";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
import { toOne } from "@/lib/utils/relations";

export default async function MyWatchlistPage() {
  const supabase = await createClient();
  const { locale, dict } = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rows, error } = await supabase
    .from("event_watchlist")
    .select(`
      event_id,
      events (
        title,
        slug,
        venue,
        city,
        event_date
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Errore caricamento watchlist:", error);
    throw new Error(error.message);
  }

  const items = (rows ?? [])
    .map((row) => {
      const event = toOne(row.events);

      if (!event) {
        return null;
      }

      return {
        eventId: row.event_id,
        eventTitle: event.title,
        eventSlug: event.slug,
        eventVenue: event.venue,
        eventCity: event.city,
        eventDate: event.event_date,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <main className="mx-auto max-w-7xl px-6 pt-28 pb-24">
      <div className="mb-10">
        <h1 className="mt-5 text-2xl font-semibold text-foreground">
          {dict.dashboardWatchlist.listPage.title}
        </h1>

        <p className="mt-4 text-lg text-muted-foreground">
          {dict.dashboardWatchlist.listPage.subtitle}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center">
          <EmptyState
            title={dict.dashboardWatchlist.listPage.emptyTitle}
            description={dict.dashboardWatchlist.listPage.emptyDescription}
          />

          <Link
            href="/events"
            className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {dict.dashboardWatchlist.listPage.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {items.map((item) => (
            <WatchlistCard
              key={item.eventId}
              dict={dict.dashboardWatchlist.listPage}
              watchlistDict={dict.events.watchlist}
              locale={locale}
              item={item}
            />
          ))}
        </div>
      )}
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import AdminEventTable from "@/components/admin/AdminEventTable";
import ImportTicketmasterButton from "@/components/admin/ImportTicketmasterButton";
import BackfillCityVenueButton from "@/components/admin/BackfillCityVenueButton";
import BackfillArtistSlugButton from "@/components/admin/BackfillArtistSlugButton";

type Props = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function AdminEventsPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const supabase = await createClient();

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

  // Carica eventi
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="mx-auto max-w-7xl p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Gestione eventi
          </h1>

          <p className="mt-2 text-slate-500">
            Gestisci tutti gli eventi di Car2ne.
          </p>
        </div>

        <div className="flex gap-3">
          <BackfillCityVenueButton />

          <BackfillArtistSlugButton />

          <ImportTicketmasterButton />

          <Link
            href="/admin/events/new"
            className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
          >
            + Nuovo evento
          </Link>
        </div>
      </div>

      <AdminEventTable
        key={params.filter ?? "all"}
        events={events ?? []}
        initialFilter={params.filter}
      />
    </main>
  );
}
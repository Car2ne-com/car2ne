import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import AdminEventSuggestionTable from "@/components/admin/AdminEventSuggestionTable";
import { toOne } from "@/lib/utils/relations";
import { getTranslations } from "@/lib/i18n";

export default async function AdminEventSuggestionsPage() {
  const supabase = await createClient();
  const { dict } = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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

  const { data: suggestions, error } = await supabase
    .from("event_suggestions")
    .select(
      `
      id,
      title,
      artist,
      venue,
      city,
      event_date,
      external_url,
      image_url,
      description,
      status,
      created_at,
      suggester:profiles!event_suggestions_suggested_by_fkey (
        name,
        surname
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const formatted = (suggestions ?? []).map((s) => {
    const suggester = toOne(s.suggester);

    return {
      id: s.id,
      title: s.title,
      artist: s.artist,
      venue: s.venue,
      city: s.city,
      eventDate: s.event_date,
      externalUrl: s.external_url,
      imageUrl: s.image_url,
      description: s.description,
      status: s.status,
      createdAt: s.created_at,
      suggesterName: [suggester?.name, suggester?.surname]
        .filter(Boolean)
        .join(" "),
    };
  });

  return (
    <main className="mx-auto max-w-7xl p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {dict.admin.eventSuggestionsPage.title}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {dict.admin.eventSuggestionsPage.subtitle}
        </p>
      </div>

      <AdminEventSuggestionTable
        suggestions={formatted}
        dict={dict.admin.eventSuggestionTable}
      />
    </main>
  );
}

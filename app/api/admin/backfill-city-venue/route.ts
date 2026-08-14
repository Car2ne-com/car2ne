import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { backfillCityVenue } from "@/lib/importers/backfillCityVenue";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Non autenticato." },
      { status: 401 }
    );
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (
    profileError ||
    profile?.role !== "admin"
  ) {
    return NextResponse.json(
      { error: "Accesso non autorizzato." },
      { status: 403 }
    );
  }

  try {
    const result = await backfillCityVenue();

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Errore backfill città/venue:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Backfill fallito.",
      },
      { status: 500 }
    );
  }
}

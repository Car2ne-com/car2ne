import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { runImport } from "@/lib/importers/runImport";

/*
 * Trigger manuale dell'importazione Ticketmaster,
 * richiamabile dalla dashboard admin. Usa la stessa
 * runImport() del cron: nessuna logica duplicata.
 */

const COOLDOWN_MS = 5 * 60 * 1000;

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

  /*
   * ==============================
   * COOLDOWN
   * ==============================
   *
   * Evita che un click ripetuto (o un doppio
   * submit accidentale) sprechi la quota
   * giornaliera di Ticketmaster con importazioni
   * ravvicinate inutili.
   */

  const { data: lastRun, error: lastRunError } =
    await supabase
      .from("import_logs")
      .select("started_at")
      .eq("source", "ticketmaster")
      .order("started_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  if (lastRunError) {
    console.error(
      "Errore controllo cooldown import:",
      lastRunError
    );
  }

  if (lastRun) {
    const elapsedMs =
      Date.now() -
      new Date(lastRun.started_at).getTime();

    if (elapsedMs < COOLDOWN_MS) {
      const waitSeconds = Math.ceil(
        (COOLDOWN_MS - elapsedMs) / 1000
      );

      return NextResponse.json(
        {
          error: `Importazione già eseguita di recente. Riprova tra ${waitSeconds} secondi.`,
        },
        { status: 429 }
      );
    }
  }

  try {
    const result = await runImport(
      "ticketmaster",
      "manual",
      user.id
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Errore trigger manuale import Ticketmaster:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Importazione fallita.",
      },
      { status: 500 }
    );
  }
}

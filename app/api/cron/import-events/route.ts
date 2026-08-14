import { NextResponse } from "next/server";

import { runImport } from "@/lib/importers/runImport";

/*
 * Entrypoint per il cron (Vercel Cron o simili).
 * Protetto da un header Authorization con un
 * segreto condiviso — non deve mai essere
 * raggiungibile pubblicamente senza autenticazione.
 *
 * Configurazione Vercel Cron (vercel.json), quando
 * si passa alla Fase 9:
 * {
 *   "crons": [
 *     { "path": "/api/cron/import-events", "schedule": "0 4 * * *" }
 *   ]
 * }
 * Vercel Cron invia già l'header Authorization con
 * CRON_SECRET se impostato nelle env var del progetto.
 *
 * Fonti attive oggi: solo Ticketmaster. Aggiungere una
 * nuova fonte significa aggiungere una chiave a questo
 * array, non riscrivere la route.
 */
const ACTIVE_SOURCES = ["ticketmaster"];

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error(
      "CRON_SECRET non configurato: import cron disabilitato."
    );

    return NextResponse.json(
      { error: "Cron non configurato." },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get(
    "authorization"
  );

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Non autorizzato." },
      { status: 401 }
    );
  }

  const results = [];

  for (const source of ACTIVE_SOURCES) {
    try {
      const result = await runImport(
        source,
        "cron",
        null
      );

      results.push(result);
    } catch (error) {
      console.error(
        `Cron import fallito per ${source}:`,
        error
      );

      results.push({
        source,
        errorMessage:
          error instanceof Error
            ? error.message
            : "Importazione fallita.",
      });
    }
  }

  return NextResponse.json({ results });
}

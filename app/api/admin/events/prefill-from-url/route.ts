import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { extractEventFromHtml } from "@/lib/admin/eventUrlPrefill";

/*
 * Precompila il form "nuovo evento" leggendo UNA sola pagina
 * pubblica di ticketone.it, su azione esplicita di un admin (mai un
 * cron/crawl programmato — vedi bottone "Precompila da URL" in
 * AdminEventForm). L'host è ristretto a ticketone.it per evitare che
 * questa route diventi un proxy fetch generico verso URL arbitrari.
 */

const ALLOWED_HOSTS = new Set(["www.ticketone.it", "ticketone.it"]);

const FETCH_TIMEOUT_MS = 10000;

export async function POST(request: Request) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const body = (await request.json().catch(() => null)) as
    | { url?: unknown }
    | null;

  const rawUrl = typeof body?.url === "string" ? body.url : "";

  if (!rawUrl) {
    return NextResponse.json(
      { error: "URL mancante." },
      { status: 400 }
    );
  }

  let target: URL;

  try {
    target = new URL(rawUrl);
  } catch {
    return NextResponse.json(
      { error: "URL non valido." },
      { status: 400 }
    );
  }

  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
    return NextResponse.json(
      { error: "Sono supportati solo URL di ticketone.it." },
      { status: 400 }
    );
  }

  let html: string;

  try {
    const response = await fetch(target.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Car2neAdminTool/1.0)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `TicketOne ha risposto ${response.status}.` },
        { status: 502 }
      );
    }

    html = await response.text();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Impossibile raggiungere la pagina: ${error.message}`
            : "Impossibile raggiungere la pagina.",
      },
      { status: 502 }
    );
  }

  const result = extractEventFromHtml(html);

  if (!result.title) {
    return NextResponse.json(
      { error: "Nessun dato evento riconosciuto in questa pagina." },
      { status: 422 }
    );
  }

  return NextResponse.json(result);
}

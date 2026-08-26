import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/*
 * Throttling generico per endpoint sensibili (auth, segnalazioni, ...),
 * appoggiato alla funzione Postgres check_rate_limit (vedi
 * supabase/migrations/0032_rate_limit_hits.sql) invece di un servizio
 * esterno come Upstash Redis.
 *
 * Fail-open per design: se il rate limiter stesso è irraggiungibile
 * (tabella non ancora migrata, hiccup di rete), meglio lasciar passare
 * la richiesta che bloccare utenti legittimi per un problema nostro.
 */
export async function checkRateLimit(
  bucket: string,
  key: string,
  { windowSeconds, maxHits }: { windowSeconds: number; maxHits: number }
) {
  const admin = createAdminClient();

  const { data, error } = await admin.rpc("check_rate_limit", {
    p_bucket: bucket,
    p_key: key,
    p_window_seconds: windowSeconds,
    p_max_hits: maxHits,
  });

  if (error) {
    console.error(`Errore rate limit (${bucket}):`, error.message);

    return true;
  }

  return data === true;
}

/*
 * Vercel/Node non espongono l'IP del client su `request` direttamente:
 * va letto dagli header impostati dal proxy/edge.
 */
export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

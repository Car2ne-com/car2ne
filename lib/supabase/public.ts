import { createClient } from "@supabase/supabase-js";

/*
 * Client anonimo (anon key, nessuna sessione/cookie) da usare SOLO per
 * dati pubblici (eventi/città/venue pubblicati) che vogliamo poter
 * avvolgere in unstable_cache: quella cache non supporta l'accesso a
 * cookies()/headers() al suo interno, quindi lib/supabase/server.ts
 * (che legge i cookie di sessione) non è utilizzabile lì dentro.
 *
 * Non usare per query il cui risultato deve dipendere da chi è
 * loggato (RLS per-utente): questo client si presenta sempre come
 * "anon", mai come l'utente autenticato.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

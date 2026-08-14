import { createClient } from "@supabase/supabase-js";

/*
 * Client con la service role key: bypassa le RLS.
 *
 * USO ESCLUSIVO SERVER-SIDE (route handler, cron, importer).
 * Non importare mai questo file da un componente client
 * o da codice che finisce nel bundle del browser.
 */

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY non configurata. " +
        "Aggiungila a .env.local (mai al frontend)."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

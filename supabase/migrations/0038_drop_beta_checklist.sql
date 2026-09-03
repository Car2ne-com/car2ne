-- Il beta test è concluso: la feature "beta checklist" (pagina dashboard +
-- sezione admin, introdotta in 0016) è stata rimossa dall'app. Qui si elimina
-- anche la tabella che la sosteneva — non è più referenziata da nessun codice.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

drop table if exists public.beta_checklist_results;

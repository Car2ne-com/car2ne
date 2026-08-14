-- Slug artista per raggruppare/collegare tutte le date di un
-- artista (pagina /artista/[slug], ricerca). A differenza di
-- cities/venues non serve una tabella a parte: l'artista non ha
-- bisogno di coordinate o normalizzazione geografica, solo di uno
-- slug stabile per raggruppare gli eventi esistenti via colonna
-- indicizzata su events.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

alter table public.events
  add column if not exists artist_slug text;

create index if not exists events_artist_slug_idx
  on public.events (artist_slug);

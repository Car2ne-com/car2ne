-- Ricerca server-side su public.cities, necessaria ora che la
-- tabella ha 7.910 righe: caricare tutto lato client (come faceva
-- CityCombobox finora) non è più praticabile, e comunque
-- select() senza range() viene troncata da PostgREST a 1000 righe.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).
--
-- Puramente additiva: un'estensione Postgres standard (unaccent,
-- contrib ufficiale) e una funzione di sola lettura. Non tocca
-- nessuna riga esistente, nessuna colonna, nessuna FK.

create extension if not exists unaccent;

-- security invoker (default): gira con i permessi di chi chiama,
-- quindi soggetta alla stessa RLS pubblica già presente su cities
-- ("Cities are publicly readable") — nessun bypass di sicurezza.
--
-- unaccent() rende la ricerca insensibile agli accenti: "citta"
-- deve trovare "Città", "peschiera" deve trovare "Peschiera
-- Borromeo" indipendentemente da come l'utente digita gli accenti.
--
-- search_query è un parametro bind, non concatenazione di stringhe
-- nella query chiamante: nessun rischio di SQL injection anche se
-- arriva da input utente non fidato.
create or replace function public.search_cities(
  search_query text,
  result_limit int default 8
)
returns setof public.cities
language sql
stable
set search_path = public, extensions
as $$
  select *
  from public.cities
  where unaccent(name) ilike unaccent('%' || search_query || '%')
  order by
    (unaccent(name) ilike unaccent(search_query || '%')) desc,
    name asc
  limit greatest(result_limit, 0)
$$;

grant execute on function public.search_cities(text, int) to anon, authenticated;

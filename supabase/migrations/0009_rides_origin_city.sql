-- Collega rides.departure_city (testo libero) all'entità City reale,
-- per evitare duplicati come "Milano" / "Milan" / "San donato" /
-- "San Donato Milanese" per lo stesso posto.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).
--
-- Nullable e non retroattivo di proposito: i rides esistenti (al
-- momento di questa migration, 3 righe) restano con
-- origin_city_id = null, non vengono toccati né rotti. Il CHECK
-- sotto è aggiunto con NOT VALID: Postgres lo applica a ogni INSERT/
-- UPDATE da questo momento in poi, ma NON valida (e quindi non fa
-- fallire la migration su) le righe già presenti in tabella. Questo
-- è il meccanismo di validazione lato database, indipendente dalla
-- UI: anche una richiesta che bypassa il form deve fornire un
-- origin_city_id non nullo che referenzi una riga reale di
-- public.cities, altrimenti viene rifiutata dal database stesso
-- (FK per l'esistenza, CHECK per l'obbligatorietà).

alter table public.rides
  add column if not exists origin_city_id uuid references public.cities(id);

create index if not exists rides_origin_city_id_idx
  on public.rides (origin_city_id);

alter table public.rides
  drop constraint if exists rides_origin_city_id_required;

alter table public.rides
  add constraint rides_origin_city_id_required
  check (origin_city_id is not null) not valid;

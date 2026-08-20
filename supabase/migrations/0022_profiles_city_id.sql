-- Collega profiles.city (testo libero) all'entità City reale,
-- stesso pattern di rides.origin_city_id (migration 0009), per
-- evitare duplicati/refusi nel campo città del profilo utente.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).
--
-- Nullable: a differenza del passaggio, la città nel profilo resta
-- facoltativa. profiles.city (testo) resta come nome denormalizzato
-- per la visualizzazione, aggiornato insieme a city_id.

alter table public.profiles
  add column if not exists city_id uuid references public.cities(id);

create index if not exists profiles_city_id_idx
  on public.profiles (city_id);

-- Trasforma public.cities da "città viste da Ticketmaster" ad
-- anagrafica ufficiale dei comuni italiani (fonte: ISTAT, vedi
-- data/comuni-italiani.json). Puramente additiva.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).
--
-- NON tocca gli UUID esistenti, NON tocca events.city_id /
-- venues.city_id, NON elimina nessuna riga. Le nuove colonne
-- restano nullable finché il seed (Fase 3, script separato) non le
-- valorizza: nessuna riga esistente viene invalidata da questa
-- migration.

alter table public.cities
  add column if not exists istat_code text,
  add column if not exists province text,
  add column if not exists province_code text;

-- Unique ma nullable: durante la riconciliazione molte righe
-- avranno istat_code = null (non ancora mappate) senza violare il
-- vincolo — in un unique index/constraint Postgres considera NULL
-- diverso da qualunque altro valore, quindi più righe con
-- istat_code null convivono senza conflitto. Una volta assegnato,
-- però, un istat_code non può comparire su due righe.
create unique index if not exists cities_istat_code_key
  on public.cities (istat_code)
  where istat_code is not null;

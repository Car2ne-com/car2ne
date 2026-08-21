-- Introduce il concetto di "direzione" per un passaggio: finora rides
-- modellava solo l'andata (una città libera -> la venue dell'evento).
-- Il ritorno (venue -> una città libera, a fine evento) non esisteva
-- affatto: un conducente non aveva modo di offrirlo né un passeggero di
-- cercarlo. Con questa migration un conducente può pubblicare fino a un
-- passaggio di andata E uno di ritorno per lo stesso evento.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

alter table public.rides
  add column if not exists direction text not null default 'outbound';

alter table public.rides
  drop constraint if exists rides_direction_check;

alter table public.rides
  add constraint rides_direction_check
  check (direction in ('outbound', 'return'));

create index if not exists rides_direction_idx
  on public.rides (direction);

-- Colonna gemella di origin_city_id (introdotta in 0009), ma per il
-- ritorno: lì l'origine è fissa (la venue), è la destinazione a essere
-- scelta liberamente dal conducente tra le città reali.
alter table public.rides
  add column if not exists destination_city_id uuid references public.cities(id);

create index if not exists rides_destination_city_id_idx
  on public.rides (destination_city_id);

-- Il vecchio vincolo "un solo passaggio attivo per evento" (unique su
-- driver_id + event_id, creato prima che questa cartella di migration
-- esistesse, quindi di nome sconosciuto) va sostituito: un conducente
-- deve ora poter avere un'andata E un ritorno attivi per lo stesso
-- evento. Lo cerchiamo dinamicamente per set di colonne coperte,
-- qualunque sia il suo nome, invece di assumerne uno.
do $$
declare
  v_constraint_name text;
begin
  select con.conname
    into v_constraint_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'rides'
    and con.contype = 'u'
    and (
      select array_agg(attname order by attname)
      from pg_attribute
      where attrelid = con.conrelid
        and attnum = any(con.conkey)
    ) = array['driver_id', 'event_id']::name[]
  limit 1;

  if v_constraint_name is not null then
    execute format(
      'alter table public.rides drop constraint %I',
      v_constraint_name
    );
  end if;
end $$;

alter table public.rides
  drop constraint if exists rides_driver_id_event_id_direction_key;

alter table public.rides
  add constraint rides_driver_id_event_id_direction_key
  unique (driver_id, event_id, direction);

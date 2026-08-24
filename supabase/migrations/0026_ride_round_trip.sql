-- La migration 0025 aveva introdotto una "direction" (outbound/return)
-- che permetteva al conducente di pubblicare fino a due passaggi
-- separati per lo stesso evento — uno di sola andata, uno di solo
-- ritorno. Si torna a un modello più semplice: un solo passaggio per
-- conducente/evento, che copre sempre sia l'andata sia il ritorno
-- (stessa città di partenza/arrivo, stessi posti, stesso contributo —
-- solo l'orario cambia tra le due tratte).
--
-- Feature introdotta il giorno prima (0025) e non ancora rilasciata:
-- nessun dato reale da preservare, quindi "direction" e
-- "destination_city_id" vengono rimosse senza backfill.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

alter table public.rides
  add column if not exists return_date date;

alter table public.rides
  add column if not exists return_time time;

alter table public.rides
  drop constraint if exists rides_return_date_required;

alter table public.rides
  add constraint rides_return_date_required
  check (return_date is not null) not valid;

alter table public.rides
  drop constraint if exists rides_return_time_required;

alter table public.rides
  add constraint rides_return_time_required
  check (return_time is not null) not valid;

-- Un solo passaggio attivo per conducente/evento (il vincolo a 3
-- colonne di 0025 permetteva andata E ritorno come righe separate).
alter table public.rides
  drop constraint if exists rides_driver_id_event_id_direction_key;

-- Se 0025 non è mai stata eseguita su questo database, il vecchio
-- vincolo pre-0025 su (driver_id, event_id) è ancora lì (con un nome
-- sconosciuto): in quel caso non serve aggiungerne uno nuovo.
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

  if v_constraint_name is null then
    alter table public.rides
      add constraint rides_driver_id_event_id_key
      unique (driver_id, event_id);
  end if;
end $$;

drop index if exists public.rides_direction_idx;

alter table public.rides
  drop constraint if exists rides_direction_check;

alter table public.rides
  drop column if exists direction;

drop index if exists public.rides_destination_city_id_idx;

alter table public.rides
  drop column if exists destination_city_id;

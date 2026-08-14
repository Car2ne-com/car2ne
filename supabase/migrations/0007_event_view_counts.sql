-- Tracking reale delle visualizzazioni evento, per rendere "Eventi
-- in evidenza" basato su popolarità effettiva invece che sul solo
-- ordine cronologico.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

alter table public.events
  add column if not exists view_count integer not null default 0;

create index if not exists events_view_count_idx
  on public.events (view_count desc);

/*
 * Incremento atomico via funzione SECURITY DEFINER: evita sia la
 * race condition di un read-modify-write lato client, sia dover
 * aprire una policy RLS di scrittura generica su events per gli
 * utenti anonimi (che potrebbero altrimenti modificare qualunque
 * campo). La funzione può SOLO incrementare view_count.
 */
create or replace function public.increment_event_views(event_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.events
  set view_count = view_count + 1
  where id = event_id;
$$;

grant execute on function public.increment_event_views(uuid)
  to anon, authenticated;

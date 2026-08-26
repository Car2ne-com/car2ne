-- Watchlist eventi: un utente può seguire un evento che non ha ancora
-- passaggi pubblicati e ricevere una notifica appena qualcuno ne
-- offre uno. Prima non esisteva alcun modo di essere avvisati: si
-- doveva ricontrollare la pagina evento a mano.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

create table if not exists public.event_watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create index if not exists event_watchlist_user_id_idx
  on public.event_watchlist (user_id);

create index if not exists event_watchlist_event_id_idx
  on public.event_watchlist (event_id);

alter table public.event_watchlist enable row level security;

drop policy if exists "Users can view own watchlist" on public.event_watchlist;
create policy "Users can view own watchlist"
  on public.event_watchlist for select
  using (auth.uid() = user_id);

drop policy if exists "Users can add to own watchlist" on public.event_watchlist;
create policy "Users can add to own watchlist"
  on public.event_watchlist for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove from own watchlist" on public.event_watchlist;
create policy "Users can remove from own watchlist"
  on public.event_watchlist for delete
  using (auth.uid() = user_id);

-- Trigger invece di una funzione RPC dedicata perche' l'inserimento di
-- un nuovo passaggio avviene gia' oggi con una insert diretta sul
-- client (OfferRideForm), protetta dalle policy RLS su public.rides.
-- Stesso pattern di 0031_rating_notifications.sql.
create or replace function public.notify_watchers_on_new_ride()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications
    (user_id, type, title, message, ride_id, is_read)
  select
    w.user_id,
    'ride_available_for_watched_event',
    'Nuovo passaggio disponibile',
    'È stato pubblicato un nuovo passaggio per un evento che stai seguendo.',
    new.id,
    false
  from public.event_watchlist w
  where w.event_id = new.event_id
    and w.user_id <> new.driver_id;

  return new;
end;
$$;

drop trigger if exists rides_notify_watchers on public.rides;
create trigger rides_notify_watchers
  after insert on public.rides
  for each row
  execute function public.notify_watchers_on_new_ride();

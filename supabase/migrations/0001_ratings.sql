-- Sistema di recensioni tra conducente e passeggero.
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  ride_id uuid not null references public.rides(id) on delete cascade,
  rater_id uuid not null references public.profiles(id) on delete cascade,
  ratee_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (booking_id, rater_id)
);

create index if not exists ratings_ratee_id_idx
  on public.ratings (ratee_id);

alter table public.ratings enable row level security;

-- Le recensioni sono pubbliche: chiunque puo' vederle
-- (servono per mostrare l'affidabilita' di conducenti e passeggeri).
drop policy if exists "Ratings are publicly readable" on public.ratings;
create policy "Ratings are publicly readable"
  on public.ratings for select
  using (true);

-- Si puo' recensire solo una prenotazione confermata e conclusa
-- (la data di partenza deve essere passata), e solo la controparte
-- reale di quella prenotazione (conducente <-> passeggero).
drop policy if exists "Users can rate completed bookings" on public.ratings;
create policy "Users can rate completed bookings"
  on public.ratings for insert
  with check (
    auth.uid() = rater_id
    and exists (
      select 1
      from public.bookings b
      join public.rides r on r.id = b.ride_id
      where b.id = ratings.booking_id
        and r.id = ratings.ride_id
        and b.status = 'confirmed'
        and (r.departure_date < current_date
             or (r.departure_date = current_date
                 and r.departure_time <= current_time))
        and (
          (auth.uid() = b.passenger_id and ratings.ratee_id = r.driver_id)
          or
          (auth.uid() = r.driver_id and ratings.ratee_id = b.passenger_id)
        )
    )
  );

drop policy if exists "Users can update their own ratings" on public.ratings;
create policy "Users can update their own ratings"
  on public.ratings for update
  using (auth.uid() = rater_id)
  with check (auth.uid() = rater_id);

drop policy if exists "Users can delete their own ratings" on public.ratings;
create policy "Users can delete their own ratings"
  on public.ratings for delete
  using (auth.uid() = rater_id);

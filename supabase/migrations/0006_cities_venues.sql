-- Cities & Venues: entità persistenti per collegare gli eventi
-- (Ticketmaster e fonti future) a città e venue normalizzate,
-- in vista delle pagine SEO /citta/[slug] e /citta/[slug]/venue/[slug].
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).
--
-- Non tocca events.city / events.venue (restano come oggi, valori
-- testuali). Aggiunge solo due colonne FK nullable: un evento privo
-- di match resta importabile esattamente come prima di questa
-- migration, semplicemente senza city_id/venue_id.

/*
 * ==============================
 * CITIES
 * ==============================
 */

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  country_code text not null default 'IT',
  region text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists cities_country_slug_key
  on public.cities (country_code, slug);

alter table public.cities enable row level security;

-- Lettura pubblica: servono alle pagine SEO /citta/[slug].
drop policy if exists "Cities are publicly readable" on public.cities;
create policy "Cities are publicly readable"
  on public.cities for select
  using (true);

/*
 * ==============================
 * VENUES
 * ==============================
 */

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete restrict,
  name text not null,
  slug text not null,
  address text,
  latitude numeric,
  longitude numeric,
  source text,
  external_ids jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Slug univoco solo dentro la città: due venue omonime in città
-- diverse (caso raro ma possibile) non collidono.
create unique index if not exists venues_city_slug_key
  on public.venues (city_id, slug);

create index if not exists venues_city_id_idx
  on public.venues (city_id);

alter table public.venues enable row level security;

drop policy if exists "Venues are publicly readable" on public.venues;
create policy "Venues are publicly readable"
  on public.venues for select
  using (true);

/*
 * ==============================
 * EVENTS: collegamento a città/venue
 * ==============================
 *
 * Nullable e aggiuntive: events.city / events.venue (testo) restano
 * la fonte di verità per la UI esistente finché non vengono
 * migrate. L'import continua a funzionare anche se il resolver
 * città/venue fallisce per un evento (city_id/venue_id restano null).
 */

alter table public.events
  add column if not exists city_id uuid references public.cities(id) on delete set null,
  add column if not exists venue_id uuid references public.venues(id) on delete set null;

create index if not exists events_city_id_idx
  on public.events (city_id);

create index if not exists events_venue_id_idx
  on public.events (venue_id);

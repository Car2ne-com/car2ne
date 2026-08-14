-- Importazione automatica eventi (prima fonte: Ticketmaster).
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).
--
-- Nota sullo status: non introduciamo un nuovo valore "pending". Gli eventi
-- importati vengono creati con status = 'draft' (gia' esistente, gia'
-- nascosto al pubblico) in attesa di revisione admin. "Aggiornato di
-- recente" si deduce confrontando imported_at con updated_at, non e' un
-- vero e proprio stato del ciclo di vita.

/*
 * ==============================
 * COLONNE IMPORT SU EVENTS
 * ==============================
 */

alter table public.events
  add column if not exists source text,
  add column if not exists external_id text,
  add column if not exists external_url text,
  add column if not exists imported_at timestamptz,
  add column if not exists raw_payload jsonb;

-- Un evento esterno (stessa fonte + stesso id esterno) non puo'
-- comparire due volte. Le righe con source/external_id nulli
-- (eventi creati manualmente) non sono soggette al vincolo.
alter table public.events
  drop constraint if exists events_source_external_id_key;

alter table public.events
  add constraint events_source_external_id_key
  unique (source, external_id);

create index if not exists events_source_idx
  on public.events (source);

/*
 * ==============================
 * LOG DELLE IMPORTAZIONI
 * ==============================
 */

create table if not exists public.import_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  triggered_by text not null check (triggered_by in ('manual', 'cron')),
  triggered_by_user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'running' check (status in ('running', 'success', 'failed')),
  events_fetched integer not null default 0,
  events_created integer not null default 0,
  events_updated integer not null default 0,
  events_skipped integer not null default 0,
  events_failed integer not null default 0,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists import_logs_source_idx
  on public.import_logs (source, started_at desc);

alter table public.import_logs enable row level security;

-- Solo gli admin possono leggere i log. Le scritture avvengono
-- esclusivamente tramite il client service-role (bypassa le RLS),
-- mai da un utente autenticato normale.
drop policy if exists "Admins can read import logs" on public.import_logs;
create policy "Admins can read import logs"
  on public.import_logs for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

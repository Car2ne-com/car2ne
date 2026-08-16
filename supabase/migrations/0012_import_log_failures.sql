-- Diagnostica import Ticketmaster (fase 1): logging persistente dei
-- fallimenti per-evento, oggi visibili solo come un numero
-- (import_logs.events_failed) con la causa reale persa in un
-- console.error che sparisce alla fine del processo. Aggiunge anche
-- un contatore per gli eventi scartati dal normalizer prima ancora
-- di entrare nel ciclo di dedup/scrittura (oggi solo console.warn).
--
-- SOLO diagnostica: non cambia il comportamento dell'import. Un
-- fallimento per singolo evento continua a non bloccare il resto
-- del run, viene solo anche registrato qui invece che solo loggato.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor ->
-- New query), stesso procedimento già usato per 0004_ticketmaster_import.sql.

alter table public.import_logs
  add column if not exists events_rejected integer not null default 0;

comment on column public.import_logs.events_rejected is
  'Eventi scartati dal normalizer per dati essenziali mancanti (titolo/data/venue/città), prima del dedup. Non sono inclusi in events_fetched, che è già il conteggio post-normalizzazione.';

create table if not exists public.import_log_failures (
  id uuid primary key default gen_random_uuid(),
  import_log_id uuid not null references public.import_logs(id) on delete cascade,
  source text not null,
  external_id text,
  title text,
  artist text,
  event_date timestamptz,
  city text,
  venue text,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists import_log_failures_import_log_id_idx
  on public.import_log_failures (import_log_id);

alter table public.import_log_failures enable row level security;

-- Stessa policy di import_logs: solo admin possono leggere. Le
-- scritture avvengono esclusivamente dal client service-role dentro
-- runImport(), mai da un utente autenticato normale.
drop policy if exists "Admins can read import log failures" on public.import_log_failures;
create policy "Admins can read import log failures"
  on public.import_log_failures for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

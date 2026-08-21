-- Segnalazioni di eventi mancanti da parte degli utenti (es. eventi
-- esclusivi TicketOne/Vivaticket che non arrivano dall'import
-- Ticketmaster). Chi segnala scrive gia' i campi dell'evento vero e
-- proprio: l'admin non li ridigita, si limita ad approvare (crea la
-- riga in events) o rifiutare.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

create table if not exists public.event_suggestions (
  id uuid primary key default gen_random_uuid(),
  suggested_by uuid not null references public.profiles(id) on delete cascade,

  title text not null,
  artist text not null,
  venue text not null,
  city text not null,
  event_date timestamptz not null,
  external_url text,
  image_url text,
  description text,

  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected')
  ),

  -- Valorizzato solo se approved: l'evento creato da questa segnalazione.
  created_event_id uuid references public.events(id) on delete set null,

  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,

  created_at timestamptz not null default now()
);

create index if not exists event_suggestions_status_idx
  on public.event_suggestions (status);

create index if not exists event_suggestions_suggested_by_idx
  on public.event_suggestions (suggested_by);

alter table public.event_suggestions enable row level security;

-- Chi segnala vede sempre le proprie segnalazioni; l'admin le vede tutte.
drop policy if exists "Users can view own event suggestions" on public.event_suggestions;
create policy "Users can view own event suggestions"
  on public.event_suggestions for select
  using (
    auth.uid() = suggested_by
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Users can create event suggestions" on public.event_suggestions;
create policy "Users can create event suggestions"
  on public.event_suggestions for insert
  with check (auth.uid() = suggested_by);

-- Nessuna policy di update per chi segnala: una volta inviata, la
-- gestisce solo l'admin (nessuna policy di delete per nessuno, si
-- mantiene lo storico anche dei rifiuti).
drop policy if exists "Admins can update event suggestions" on public.event_suggestions;
create policy "Admins can update event suggestions"
  on public.event_suggestions for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

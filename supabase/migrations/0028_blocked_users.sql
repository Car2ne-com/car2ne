-- Blocco utenti.
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

create table if not exists public.blocked_users (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint blocked_users_no_self check (blocker_id <> blocked_id),
  constraint blocked_users_unique unique (blocker_id, blocked_id)
);

create index if not exists blocked_users_blocker_idx on public.blocked_users (blocker_id);
create index if not exists blocked_users_blocked_idx on public.blocked_users (blocked_id);

alter table public.blocked_users enable row level security;

-- Entrambe le parti devono poter leggere la riga: la persona bloccata
-- deve poterla vedere lato server per far chiudere chat/prenotazioni
-- anche dalla propria sessione (RLS e' valutata con auth.uid() di chi
-- interroga, non esiste un ruolo "controparte"). Non mostriamo pero'
-- mai in UI la frase "sei stato bloccato": i testi restano generici,
-- come gia' avviene per "prenotazione non piu' attiva".
drop policy if exists "Users can view own blocks" on public.blocked_users;
create policy "Users can view own blocks"
  on public.blocked_users for select
  using (auth.uid() = blocker_id or auth.uid() = blocked_id);

drop policy if exists "Users can create own blocks" on public.blocked_users;
create policy "Users can create own blocks"
  on public.blocked_users for insert
  with check (auth.uid() = blocker_id);

-- Solo chi ha bloccato puo' rimuovere il blocco.
drop policy if exists "Users can delete own blocks" on public.blocked_users;
create policy "Users can delete own blocks"
  on public.blocked_users for delete
  using (auth.uid() = blocker_id);

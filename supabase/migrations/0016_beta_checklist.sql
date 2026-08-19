-- Risultati della checklist per i beta tester: ogni riga è l'esito che un
-- utente ha segnato per un item della checklist (app/dashboard/beta-checklist).
-- Nessuna riga per uno stato "non testato" (implicito: nessuna riga trovata).
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

create table if not exists public.beta_checklist_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  status text not null check (status in ('ok', 'problem')),
  note text,
  updated_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create index if not exists beta_checklist_results_user_id_idx
  on public.beta_checklist_results (user_id);

alter table public.beta_checklist_results enable row level security;

drop policy if exists "Users manage their own beta checklist results" on public.beta_checklist_results;
create policy "Users manage their own beta checklist results"
  on public.beta_checklist_results for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins can read all beta checklist results" on public.beta_checklist_results;
create policy "Admins can read all beta checklist results"
  on public.beta_checklist_results for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

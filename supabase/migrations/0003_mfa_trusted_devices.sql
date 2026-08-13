-- Dispositivi fidati per l'MFA: permette di non richiedere il codice
-- a due fattori per 14 giorni su un dispositivo scelto dall'utente
-- (checkbox opt-in al momento della verifica).
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

create table if not exists public.mfa_trusted_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists mfa_trusted_devices_user_id_idx
  on public.mfa_trusted_devices (user_id);

create index if not exists mfa_trusted_devices_token_hash_idx
  on public.mfa_trusted_devices (token_hash);

alter table public.mfa_trusted_devices enable row level security;

-- Un utente puo' creare, leggere ed eliminare solo i propri
-- dispositivi fidati. Non serve mai aggiornarli (si ricreano).
drop policy if exists "Users manage their own trusted devices" on public.mfa_trusted_devices;
create policy "Users manage their own trusted devices"
  on public.mfa_trusted_devices for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Reset password via codice OTP inviato con Brevo, al posto del
-- flusso email nativo di Supabase Auth (resetPasswordForEmail):
-- link monouso che finivano "bruciati" dal click-tracking di Brevo
-- prima ancora che l'utente li aprisse.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

create table if not exists public.password_reset_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists password_reset_codes_user_id_idx
  on public.password_reset_codes (user_id);

-- RLS abilitata senza alcuna policy: solo il service role (route
-- handler server-side con createAdminClient) può leggere/scrivere
-- questa tabella, stesso pattern di email_verification_codes.
alter table public.password_reset_codes enable row level security;

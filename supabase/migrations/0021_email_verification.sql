-- Verifica email via codice OTP inviato con Brevo, al posto del
-- flusso "Confirm email" nativo di Supabase (non desiderato).
--
-- IMPORTANTE: perché questo flusso funzioni, "Confirm email" deve
-- essere DISATTIVATO in Supabase Dashboard -> Authentication ->
-- Providers -> Email. Altrimenti supabase.auth.signUp() non crea
-- una sessione finché l'utente non clicca il link di conferma
-- nativo di Supabase, e /verifica-email (che richiede un utente
-- già autenticato) reindirizzerebbe sempre a /login.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

alter table public.profiles
  add column if not exists email_verified_at timestamptz;

-- Gli utenti già esistenti al momento di questa migration sono
-- considerati verificati: il gate si applica solo alle nuove
-- registrazioni da qui in avanti, non retroattivamente.
update public.profiles
  set email_verified_at = now()
  where email_verified_at is null;

create table if not exists public.email_verification_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists email_verification_codes_user_id_idx
  on public.email_verification_codes (user_id);

-- RLS abilitata senza alcuna policy: solo il service role (route
-- handler server-side con createAdminClient) può leggere/scrivere
-- questa tabella. Client e utenti autenticati non devono mai poter
-- leggere gli hash dei codici, nemmeno i propri.
alter table public.email_verification_codes enable row level security;

-- IMPORTANTE: la policy RLS esistente su public.profiles permette
-- già agli utenti autenticati di aggiornare la propria riga (city,
-- bio, avatar_url, ...). Senza questo trigger, un utente potrebbe
-- auto-marcarsi come verificato dal browser (es. dalla console)
-- chiamando direttamente supabase.from("profiles").update({
-- email_verified_at: ... }), bypassando del tutto l'OTP. Il trigger
-- blocca qualsiasi modifica a questa colonna che non arrivi dal
-- service role (il client admin usato da lib/email/emailVerification.ts
-- e da app/auth/callback/route.ts), ripristinando il valore precedente.
create or replace function public.protect_email_verified_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_verified_at is distinct from old.email_verified_at
     and coalesce(auth.role(), '') <> 'service_role' then
    new.email_verified_at := old.email_verified_at;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_email_verified_at on public.profiles;

create trigger profiles_protect_email_verified_at
  before update on public.profiles
  for each row
  execute function public.protect_email_verified_at();

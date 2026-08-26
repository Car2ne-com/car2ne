-- Rate limiting generico per endpoint sensibili (reset password,
-- segnalazioni, ...) senza introdurre un servizio esterno (Upstash/Redis):
-- un contatore di tentativi per "bucket" (l'azione, es. "forgot-password")
-- + "key" (chi, es. IP o user id), con pulizia automatica delle righe
-- scadute ad ogni check.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

create table if not exists public.rate_limit_hits (
  id bigint generated always as identity primary key,
  bucket text not null,
  key text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_bucket_key_created_idx
  on public.rate_limit_hits (bucket, key, created_at desc);

-- RLS abilitata senza alcuna policy: solo il service role (route handler
-- server-side con createAdminClient) può leggere/scrivere questa tabella,
-- stesso pattern di password_reset_codes.
alter table public.rate_limit_hits enable row level security;

-- Conta i tentativi di `p_key` per `p_bucket` nella finestra degli ultimi
-- `p_window_seconds` secondi e, se sotto soglia, registra il tentativo
-- corrente nello stesso giro (evita la race tra "conta" e "inserisci"
-- fatte come due query separate dal chiamante). Ritorna false se la
-- soglia `p_max_hits` è già stata raggiunta/superata.
create or replace function public.check_rate_limit(
  p_bucket text,
  p_key text,
  p_window_seconds int,
  p_max_hits int
) returns boolean
language plpgsql
as $$
declare
  v_count int;
begin
  delete from public.rate_limit_hits
  where bucket = p_bucket
    and created_at < now() - make_interval(secs => p_window_seconds);

  select count(*) into v_count
  from public.rate_limit_hits
  where bucket = p_bucket
    and key = p_key
    and created_at >= now() - make_interval(secs => p_window_seconds);

  if v_count >= p_max_hits then
    return false;
  end if;

  insert into public.rate_limit_hits (bucket, key) values (p_bucket, p_key);

  return true;
end;
$$;

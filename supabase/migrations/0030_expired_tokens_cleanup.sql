-- Pulizia notturna dei record scaduti che oggi vengono cancellati solo
-- "lazy" (quando l'utente ripassa dal relativo endpoint e li trova
-- scaduti). Se l'utente abbandona il flusso, la riga resta per sempre:
-- codici OTP di verifica email/reset password mai completati, o
-- dispositivi MFA fidati oltre i 14 giorni di validità.
--
-- Stesso pattern di 0017_driver_verifications.sql (cleanup_stale_driver_verifications).
--
-- IMPORTANTE: richiede l'estensione pg_cron abilitata da Dashboard ->
-- Database -> Extensions (già richiesta per 0002 e 0017).
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

create or replace function public.cleanup_expired_tokens()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.email_verification_codes
  where expires_at < now();

  delete from public.password_reset_codes
  where expires_at < now();

  delete from public.mfa_trusted_devices
  where expires_at < now();
end;
$$;

select cron.schedule(
  'daily-expired-tokens-cleanup',
  '0 4 * * *',
  $$ select public.cleanup_expired_tokens(); $$
);

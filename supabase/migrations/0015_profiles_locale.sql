-- Aggiunge la lingua preferita al profilo utente.
--
-- Serve alle email innescate lato database (es. la Edge Function
-- notify-email, chiamata da un trigger su insert in notifications):
-- quel percorso non ha accesso al cookie NEXT_LOCALE del browser,
-- quindi senza questa colonna le email di prenotazione potrebbero
-- essere solo in italiano. Viene sincronizzata da setLocaleAction
-- (lib/i18n/actions.ts) ogni volta che un utente loggato cambia lingua.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

alter table public.profiles
  add column if not exists locale text not null default 'it';

alter table public.profiles
  add constraint profiles_locale_check check (locale in ('it', 'en'));

-- I Database Webhook di Supabase hanno consegna "at-least-once": una
-- singola INSERT in notifications puo' invocare la Edge Function due
-- volte (es. timeout su cold start con conseguente retry), causando
-- l'invio di email/push duplicate via Brevo pur avendo una sola riga
-- di notifica e un solo webhook registrato (verificato entrambi in
-- produzione dopo la segnalazione utente del 2026-08-26).
--
-- Queste colonne permettono a notify-email/notify-push di "reclamare"
-- l'invio con una UPDATE atomica (set ... where ... is null) prima di
-- contattare Brevo/il servizio push: se la riga e' gia' reclamata, la
-- seconda invocazione salta l'invio.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

alter table public.notifications
  add column if not exists email_sent_at timestamptz,
  add column if not exists push_sent_at timestamptz;

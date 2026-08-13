-- Promemoria automatico per lasciare una recensione,
-- creato il giorno dopo la partenza di un passaggio confermato.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).
--
-- IMPORTANTE: prima di eseguire questo script, abilita l'estensione
-- pg_cron da Dashboard -> Database -> Extensions -> cerca "pg_cron" -> Enable.

create or replace function public.create_review_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Promemoria per il passeggero: recensisci il conducente.
  insert into public.notifications
    (user_id, type, title, message, booking_id, ride_id, is_read)
  select
    b.passenger_id,
    'review_reminder_passenger',
    'Com''è andato il viaggio?',
    'Lascia una recensione al conducente per aiutare la community.',
    b.id,
    r.id,
    false
  from public.bookings b
  join public.rides r on r.id = b.ride_id
  where b.status = 'confirmed'
    and r.departure_date = (current_date - interval '1 day')::date
    and not exists (
      select 1 from public.notifications n
      where n.booking_id = b.id
        and n.user_id = b.passenger_id
        and n.type = 'review_reminder_passenger'
    );

  -- Promemoria per il conducente: recensisci il passeggero.
  insert into public.notifications
    (user_id, type, title, message, booking_id, ride_id, is_read)
  select
    r.driver_id,
    'review_reminder_driver',
    'Com''è andato il viaggio?',
    'Lascia una recensione al passeggero per aiutare la community.',
    b.id,
    r.id,
    false
  from public.bookings b
  join public.rides r on r.id = b.ride_id
  where b.status = 'confirmed'
    and r.departure_date = (current_date - interval '1 day')::date
    and not exists (
      select 1 from public.notifications n
      where n.booking_id = b.id
        and n.user_id = r.driver_id
        and n.type = 'review_reminder_driver'
    );
end;
$$;

-- Esegue la funzione ogni giorno alle 09:00 (fuso orario del database,
-- di solito UTC su Supabase).
select cron.schedule(
  'daily-review-reminders',
  '0 9 * * *',
  $$ select public.create_review_reminders(); $$
);

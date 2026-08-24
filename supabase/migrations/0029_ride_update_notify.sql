-- Notifica i passeggeri quando l'autista modifica un passaggio.
-- Prima nessuno veniva avvisato: chi aveva una richiesta pending o
-- una prenotazione confermata scopriva orari/posti/contributo
-- cambiati solo ricontrollando a mano la pagina. Stesso pattern gia'
-- usato per cancel_ride (security definer, perche' la RLS normale non
-- permette a un utente di inserire una notifica per un altro utente).
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

create or replace function public.update_ride(
  p_ride_id uuid,
  p_origin_city_id uuid,
  p_departure_city text,
  p_departure_time time,
  p_return_date date,
  p_return_time time,
  p_available_seats int,
  p_contribution numeric,
  p_description text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_driver_id uuid;
begin
  select driver_id into v_driver_id
  from public.rides
  where id = p_ride_id;

  if v_driver_id is null then
    raise exception 'Passaggio non trovato.';
  end if;

  if v_driver_id <> auth.uid() then
    raise exception 'Non autorizzato a modificare questo passaggio.';
  end if;

  update public.rides
  set origin_city_id = p_origin_city_id,
      departure_city = p_departure_city,
      departure_time = p_departure_time,
      return_date = p_return_date,
      return_time = p_return_time,
      available_seats = p_available_seats,
      contribution = p_contribution,
      description = p_description
  where id = p_ride_id;

  -- Avvisa chi ha una richiesta pending o confermata: prima di
  -- rifiutare/cancellare, non dopo. Stesso identificativo booking_id/
  -- ride_id di cancel_ride, cosi' il link della notifica porta gia'
  -- dove serve (vedi getNotificationHref in lib/utils/notifications.tsx).
  insert into public.notifications
    (user_id, type, title, message, booking_id, ride_id, is_read)
  select
    b.passenger_id,
    'ride_updated',
    'Passaggio modificato',
    'L''autista ha modificato i dettagli del passaggio: controlla orari, posti e contributo aggiornati.',
    b.id,
    p_ride_id,
    false
  from public.bookings b
  where b.ride_id = p_ride_id
    and b.status in ('pending', 'confirmed');
end;
$$;

grant execute on function public.update_ride(
  uuid, uuid, text, time, date, time, int, numeric, text
) to authenticated;

-- Funzione per annullare un passaggio in modo sicuro: al contrario di
-- una DELETE diretta sulla riga rides (comportamento precedente del
-- bottone "Elimina passaggio"), qui il passaggio viene solo marcato
-- come cancelled — non sparisce mai fisicamente, quindi non rischia
-- di lasciare orfane le prenotazioni/recensioni già collegate.
--
-- In più, avvisa con una notifica ogni passeggero con una richiesta
-- pending o confirmed su quel passaggio: prima non succedeva nulla,
-- il passeggero scopriva l'annullamento solo ricontrollando a mano.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).
--
-- security definer + controllo esplicito su auth.uid() perché deve
-- poter inserire una notifica per un utente diverso dal chiamante
-- (il passeggero), cosa che la RLS normale non permetterebbe: stesso
-- pattern già usato per confirm_booking/reject_booking.

create or replace function public.cancel_ride(p_ride_id uuid)
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

  -- Notifica chi ha una richiesta pending o confermata, prima di
  -- cancellarle: dopo l'update sotto non si potrebbero più
  -- distinguere da richieste rifiutate/annullate in altri modi.
  insert into public.notifications
    (user_id, type, title, message, booking_id, ride_id, is_read)
  select
    b.passenger_id,
    'ride_cancelled',
    'Passaggio annullato',
    'L''autista ha annullato il passaggio per cui avevi una richiesta o prenotazione.',
    b.id,
    p_ride_id,
    false
  from public.bookings b
  where b.ride_id = p_ride_id
    and b.status in ('pending', 'confirmed');

  update public.bookings
  set status = 'cancelled'
  where ride_id = p_ride_id
    and status in ('pending', 'confirmed');

  update public.rides
  set status = 'cancelled'
  where id = p_ride_id;
end;
$$;

grant execute on function public.cancel_ride(uuid) to authenticated;

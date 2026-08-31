-- Traccia l'auto-dichiarazione di pagamento del passeggero: Car2ne non
-- gestisce mai i soldi, quindi non puo' verificare che un pagamento
-- (PayPal/Revolut/Satispay/di persona, vedi 0035) sia davvero avvenuto.
-- Puo' pero' lasciare che sia il passeggero stesso a dichiararlo dopo
-- aver usato uno dei metodi, cosi' da:
--  1) disattivare i pulsanti di pagamento sulla prenotazione una volta
--     che il passeggero ha confermato di aver pagato;
--  2) dare a Car2ne una vista aggregata su quale metodo i passeggeri
--     preferiscono davvero (dashboard admin).
--
-- Le RPC di booking esistenti (book_ride, cancel_booking,
-- confirm_booking, reject_booking) e le relative RLS policy non sono
-- tracciate in questo repo (create a mano su Supabase in passato):
-- questa funzione e' quindi autosufficiente, controlla da sola che il
-- chiamante sia il passeggero della prenotazione e che questa sia
-- confermata, senza fare affidamento su policy UPDATE che non possiamo
-- verificare da qui. Stesso pattern (security definer + controllo
-- esplicito su auth.uid()) di 0014_cancel_ride_function.sql.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

alter table public.bookings
  add column if not exists paid_at timestamptz,
  add column if not exists payment_method text;

alter table public.bookings
  drop constraint if exists bookings_payment_method_check;

alter table public.bookings
  add constraint bookings_payment_method_check
  check (payment_method is null or payment_method in ('paypal', 'revolut', 'satispay', 'in_person'));

create or replace function public.mark_booking_paid(p_booking_id uuid, p_payment_method text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_passenger_id uuid;
  v_status text;
begin
  if p_payment_method not in ('paypal', 'revolut', 'satispay', 'in_person') then
    raise exception 'Metodo di pagamento non valido.';
  end if;

  select passenger_id, status into v_passenger_id, v_status
  from public.bookings
  where id = p_booking_id;

  if v_passenger_id is null then
    raise exception 'Prenotazione non trovata.';
  end if;

  if v_passenger_id <> auth.uid() then
    raise exception 'Non autorizzato a modificare questa prenotazione.';
  end if;

  if v_status <> 'confirmed' then
    raise exception 'Solo una prenotazione confermata puo'' essere segnata come pagata.';
  end if;

  update public.bookings
  set paid_at = now(), payment_method = p_payment_method
  where id = p_booking_id;
end;
$$;

grant execute on function public.mark_booking_paid(uuid, text) to authenticated;

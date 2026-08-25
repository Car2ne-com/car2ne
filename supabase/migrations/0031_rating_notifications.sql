-- Notifica chi riceve una recensione (finora l'inserimento in
-- public.ratings non generava alcuna notifica: chi veniva recensito
-- lo scopriva solo controllando a mano il proprio profilo pubblico).
-- Trigger invece di una funzione RPC dedicata perche' l'inserimento
-- avviene gia' oggi con una insert diretta sul client (RatingForm),
-- protetta dalle policy RLS di 0001_ratings.sql.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

create or replace function public.notify_new_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications
    (user_id, type, title, message, booking_id, ride_id, is_read)
  values (
    new.ratee_id,
    'rating_received',
    'Hai ricevuto una recensione',
    'Qualcuno ha lasciato una recensione sul passaggio che avete condiviso.',
    new.booking_id,
    new.ride_id,
    false
  );

  return new;
end;
$$;

drop trigger if exists ratings_notify_new_rating on public.ratings;
create trigger ratings_notify_new_rating
  after insert on public.ratings
  for each row
  execute function public.notify_new_rating();

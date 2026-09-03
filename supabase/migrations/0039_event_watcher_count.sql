-- Conteggio pubblico di quanti utenti seguono un evento in attesa di
-- un passaggio. Serve a mostrare la domanda sulla pagina evento ("12
-- persone aspettano un passaggio") come spinta a chi potrebbe offrirne
-- uno: senza questo segnale un guidatore non sa che c'è richiesta.
--
-- La RLS su event_watchlist ("Users can view own watchlist") lascia
-- vedere a ciascuno solo le proprie righe, quindi il client non può
-- contarle in aggregato. Stessa soluzione di increment_event_views
-- (0007): una funzione SECURITY DEFINER che espone SOLO il numero,
-- non le righe né gli user_id.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

create or replace function public.event_watcher_count(event_id uuid)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::integer
  from public.event_watchlist w
  where w.event_id = event_watcher_count.event_id;
$$;

grant execute on function public.event_watcher_count(uuid)
  to anon, authenticated;

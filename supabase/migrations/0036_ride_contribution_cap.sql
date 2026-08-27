-- Backstop lato database sul "contributo spese" di un passaggio.
--
-- Il flusso vero è nel client (OfferRideForm): il contributo suggerito
-- e il tetto massimo sono calcolati sui km stimati di andata e ritorno
-- e sul numero di posti, in modo che "posti × contributo" non superi
-- mai la spesa stimata del viaggio — Car2ne è no-profit, il conducente
-- al più rientra delle spese.
--
-- Questo vincolo è solo una rete di sicurezza per valori palesemente
-- fuori scala (bug, script, chiamate diverse dal form): nessun
-- contributo a passeggero per una tratta nazionale in auto condivisa
-- arriva a 500 € nemmeno per l'andata e ritorno più lunga d'Italia.
--
-- `not valid`: non riconvalida le righe già esistenti (in prod c'è un
-- passaggio di test a 2500 € da ripulire a mano), ma vale da subito su
-- ogni nuovo insert/update. Stesso pattern di 0026.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

alter table public.rides
  drop constraint if exists rides_contribution_range;

alter table public.rides
  add constraint rides_contribution_range
  check (contribution >= 0 and contribution <= 500) not valid;

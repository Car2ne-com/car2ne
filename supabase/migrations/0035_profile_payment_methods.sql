-- Car2ne non gestisce mai i pagamenti direttamente (niente Stripe/wallet,
-- per non dover aprire partita IVA): il "contributo spese" resta un
-- semplice numero e i soldi passano fuori piattaforma tra autista e
-- passeggero.
--
-- Queste colonne permettono al driver di pubblicare sul proprio profilo
-- dei riferimenti di pagamento P2P (link, non dati bancari: niente IBAN,
-- per non detenere dati sensibili aggiuntivi) cosi' il passeggero puo'
-- pagarlo con un click invece di doversi scambiare a voce username o
-- numeri di telefono. Car2ne si limita a memorizzare e mostrare questi
-- link cosi' come inseriti dall'utente, senza costruirli ne' verificarli.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

alter table public.profiles
  add column if not exists payment_paypal_me text,
  add column if not exists payment_revolut_me text,
  add column if not exists payment_satispay_link text;

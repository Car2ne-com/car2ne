-- Estende il sistema di segnalazioni con la categoria "no_show"
-- (mancata presentazione di conducente o passeggero). Riusa la
-- tabella reports e il flusso admin esistenti invece di crearne uno
-- nuovo: stesso ciclo di vita (open -> reviewing -> resolved/dismissed)
-- e stesse notifiche automatiche al reporter.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

alter table public.reports
  drop constraint if exists reports_category_check;

alter table public.reports
  add constraint reports_category_check check (
    category in (
      'user_behavior',
      'inappropriate_content',
      'technical_issue',
      'safety',
      'no_show',
      'other'
    )
  );

-- Una sola segnalazione di no-show per prenotazione da parte dello
-- stesso utente (evita spam sulla stessa prenotazione). Non si
-- applica alle altre categorie: un utente può segnalare più
-- problemi diversi sulla stessa prenotazione.
create unique index if not exists reports_no_show_unique
  on public.reports (booking_id, reporter_id)
  where category = 'no_show';

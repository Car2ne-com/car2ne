-- Aggiunge lo stato "rejected", distinto dalla cancellazione fisica
-- della riga: un evento importato che l'admin rifiuta resta
-- tracciabile (fonte, external_id, dati originali) invece di
-- sparire, ed è naturalmente escluso dal pubblico perché tutte le
-- query pubbliche filtrano esplicitamente status = 'published'.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).
--
-- Il vincolo su events.status non ha un nome noto a priori (non
-- abbiamo accesso diretto allo schema), quindi lo cerchiamo ed
-- estendiamo dinamicamente invece di assumere un nome fisso.

do $$
declare
  found_constraint text;
begin
  for found_constraint in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_attribute att
      on att.attrelid = rel.oid
      and att.attnum = any(con.conkey)
    where rel.relname = 'events'
      and con.contype = 'c'
      and att.attname = 'status'
  loop
    execute format(
      'alter table public.events drop constraint %I',
      found_constraint
    );
  end loop;
end $$;

alter table public.events
  add constraint events_status_check
  check (
    status in (
      'draft',
      'published',
      'cancelled',
      'rejected'
    )
  );

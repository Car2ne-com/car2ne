-- Verifica conducente/veicolo.
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).
--
-- Modello "verifica-poi-cancella": il documento caricato serve solo alla
-- finestra di revisione admin, poi viene cancellato (dalla route di
-- approvazione/rifiuto, o dal job di pulizia sotto se resta troppo a
-- lungo in stato "pending"). Non conserviamo mai copie permanenti di
-- documenti d'identita': resta solo l'esito con data e responsabile.
--
-- Il bucket storage "driver-documents" va creato a mano da Dashboard ->
-- Storage -> New bucket, con "Public bucket" DISATTIVATO (come gia'
-- avviene per avatars/event-images, la cui creazione non e' tracciata
-- in una migrazione).
--
-- IMPORTANTE: prima di eseguire questo script, abilita l'estensione
-- pg_cron da Dashboard -> Database -> Extensions -> cerca "pg_cron" ->
-- Enable (se non gia' fatto per 0002_review_reminders.sql).

create table if not exists public.driver_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  vehicle_make text not null,
  vehicle_model text not null,
  vehicle_plate text not null,
  license_number text not null,
  document_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired')),
  admin_note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists driver_verifications_status_idx
  on public.driver_verifications (status);

alter table public.driver_verifications enable row level security;

-- Il proprietario vede sempre il proprio record; l'admin li vede tutti.
drop policy if exists "Users can view own verification" on public.driver_verifications;
create policy "Users can view own verification"
  on public.driver_verifications for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Users can submit own verification" on public.driver_verifications;
create policy "Users can submit own verification"
  on public.driver_verifications for insert
  with check (auth.uid() = user_id);

-- Il proprietario puo' modificare/re-inviare solo finche' non e'
-- approvato (dopo l'approvazione, solo l'admin puo' cambiarne lo stato).
drop policy if exists "Users can update own pending verification" on public.driver_verifications;
create policy "Users can update own pending verification"
  on public.driver_verifications for update
  using (auth.uid() = user_id and status != 'approved')
  with check (auth.uid() = user_id and status != 'approved');

drop policy if exists "Admins can update verifications" on public.driver_verifications;
create policy "Admins can update verifications"
  on public.driver_verifications for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Flag denormalizzato su profiles per mostrare il badge "Conducente
-- verificato" senza dover joinare driver_verifications ovunque.
alter table public.profiles
  add column if not exists is_verified_driver boolean not null default false;

create or replace function public.sync_verified_driver_flag()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set is_verified_driver = (new.status = 'approved')
  where id = new.user_id;

  return new;
end;
$$;

drop trigger if exists driver_verifications_sync_flag on public.driver_verifications;
create trigger driver_verifications_sync_flag
  after insert or update of status on public.driver_verifications
  for each row
  execute function public.sync_verified_driver_flag();

-- Storage RLS per il bucket privato driver-documents: ogni utente puo'
-- caricare/vedere solo file sotto il proprio "${user_id}/...", l'admin
-- puo' vedere tutto per la revisione. Nessuna policy pubblica.
drop policy if exists "Users can upload own verification document" on storage.objects;
create policy "Users can upload own verification document"
  on storage.objects for insert
  with check (
    bucket_id = 'driver-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users and admins can view verification documents" on storage.objects;
create policy "Users and admins can view verification documents"
  on storage.objects for select
  using (
    bucket_id = 'driver-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    )
  );

drop policy if exists "Users and admins can delete verification documents" on storage.objects;
create policy "Users and admins can delete verification documents"
  on storage.objects for delete
  using (
    bucket_id = 'driver-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    )
  );

-- Pulizia forzata: una verifica lasciata "pending" per piu' di 14 giorni
-- (l'admin non l'ha mai revisionata) perde il documento automaticamente
-- e passa a "expired", cosi' il file non resta indefinitamente in
-- storage. L'utente puo' ricaricare il documento per ripartire da capo.
create or replace function public.cleanup_stale_driver_verifications()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  stale record;
begin
  for stale in
    select id, user_id, document_path
    from public.driver_verifications
    where status = 'pending'
      and document_path is not null
      and created_at < now() - interval '14 days'
  loop
    delete from storage.objects
    where bucket_id = 'driver-documents'
      and name = stale.document_path;

    update public.driver_verifications
    set status = 'expired',
        document_path = null,
        updated_at = now()
    where id = stale.id;

    insert into public.notifications
      (user_id, type, title, message, booking_id, ride_id, is_read)
    values (
      stale.user_id,
      'driver_verification_expired',
      'Verifica scaduta',
      'La tua richiesta di verifica conducente non è stata revisionata in tempo ed è scaduta. Ricarica il documento per riprovare.',
      null,
      null,
      false
    );
  end loop;
end;
$$;

select cron.schedule(
  'daily-driver-verification-cleanup',
  '0 3 * * *',
  $$ select public.cleanup_stale_driver_verifications(); $$
);

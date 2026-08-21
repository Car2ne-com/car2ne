-- Riduce event_suggestions al solo link: i campi liberi
-- (titolo/artista/venue/citta'/data/descrizione) davano troppo
-- spazio per scrivere qualsiasi cosa senza alcun riscontro. Ora chi
-- segnala incolla solo l'URL della pagina evento; l'admin apre quel
-- link (nel proprio browser, come utente vero) e crea l'evento a
-- mano da /admin/events/new se lo ritiene valido.
--
-- Da eseguire nel SQL Editor di Supabase (Dashboard -> SQL Editor -> New query).

alter table public.event_suggestions
  drop column if exists title,
  drop column if exists artist,
  drop column if exists venue,
  drop column if exists city,
  drop column if exists event_date,
  drop column if exists description,
  drop column if exists image_url,
  drop column if exists created_event_id;

alter table public.event_suggestions
  alter column external_url set not null;

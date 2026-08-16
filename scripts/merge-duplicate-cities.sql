-- Piano di merge per le 16 coppie di città duplicate, rigenerato da
-- zero contro i dati REALI post-seed (non riusa l'audit pre-seed:
-- la coppia Bellaria-Igea Marina ha la survivor INVERTITA rispetto
-- alla prima bozza — vedi CAR2NE — CITIES/VENUES MERGE DRY RUN per
-- i dettagli). NON FA PARTE della sequenza numerata di migration in
-- supabase/migrations/: è una correzione dati one-off, non uno
-- schema change, e va eseguita SOLO dopo conferma esplicita.
--
-- NON ESEGUIRE finché non confermato.
--
-- Regola di scelta survivor: l'istat_code è la fonte di verità (non
-- il conteggio eventi). La survivor di ogni coppia è la riga che il
-- seed (lib/importers/seedItalianMunicipalities.ts) ha già associato
-- al comune ISTAT ufficiale — la sua identità (name/slug/istat_code/
-- provincia/regione) è quindi GIÀ corretta oggi: questo script non
-- rinomina alcuna città, si limita a spostare i riferimenti e
-- rimuovere le righe duplicate.
--
-- events.city e events.venue (testo) e venues.name NON vengono mai
-- toccati: "Teatro Greco di Tindari" resta "Teatro Greco di Tindari"
-- anche quando la sua città diventa "Patti".
--
-- Atomico: l'intero blocco gira in una singola transazione. Se una
-- qualunque asserzione di sicurezza fallisce, l'intera transazione
-- va in ROLLBACK automaticamente.

begin;

do $$
declare
  pairs jsonb := '[
    {"base":"Bellaria-Igea Marina","survivor_city":"abe5d129-3b81-4125-8bea-3150ae5563fa","duplicate_city":"657f097c-23be-431f-ba08-a8330a3f1f2c","survivor_venue":"ec407403-b85c-4507-a640-0958713ea284","duplicate_venue":"804f0658-30fb-452d-aa92-78fb7af36085"},
    {"base":"Cabras","survivor_city":"005ccda3-4a4c-4aa2-a1ee-2374e4e0d4ca","duplicate_city":"c2e7e8f2-1179-4e82-89e1-c126b7dbe07d","survivor_venue":"9433d0b8-bb6d-45c8-b705-84a7c8d4fd05","duplicate_venue":"63958a9a-29de-4c58-a01c-9b31a6ed1204"},
    {"base":"Casalecchio di Reno","survivor_city":"784fd698-b30b-4890-9194-e8978d3c7a15","duplicate_city":"68b6db29-c4f2-4494-99d9-ca0997d01d08","survivor_venue":"7db3300b-d5b9-4b47-b399-53ef0ac22346","duplicate_venue":"dc9732d2-d521-41db-a109-f9cb81e05a2b"},
    {"base":"Casella","survivor_city":"f9798e2f-6908-453c-b6e9-b465e7805d45","duplicate_city":"d1418c06-614a-42c8-b233-43341f83825b","survivor_venue":"f56a1a00-a54e-42f0-af95-67fd494d6e1b","duplicate_venue":"e1793c1d-d3e8-4d58-ab54-3cd88716a67a"},
    {"base":"Cernobbio","survivor_city":"799e0eb6-1d53-4437-98bf-a3c5dadb8f24","duplicate_city":"96b30282-9a8d-45bf-a5fd-5b8a60a726b8","survivor_venue":"63156a57-5e34-46ff-a420-ffe264d5776f","duplicate_venue":"a8d04509-8528-4090-9f8c-7b7fefb940a6"},
    {"base":"Chiari","survivor_city":"a85c3796-5c9d-420a-8af4-7447de18e56e","duplicate_city":"3b0e3fd7-6fff-46fe-88aa-d9548a4a8869","survivor_venue":"2643b8db-39f1-4cfd-bae6-11920ef08f9e","duplicate_venue":"ca470009-87ce-4368-88c6-3037afe6fd14"},
    {"base":"Cusano Milanino","survivor_city":"82beffa3-ca26-4597-9431-859a8940b5c3","duplicate_city":"6af0f660-17bd-4f2c-840b-07f5002fcd47","survivor_venue":"5158c291-acdb-4306-b94c-f1624ab2d3e6","duplicate_venue":"d88e1380-9312-4b7f-a677-191ac54e0c64"},
    {"base":"Gavorrano","survivor_city":"c4f8795d-f991-45b9-95d4-8f321694f7ef","duplicate_city":"e8e95b01-5a85-498e-9d95-230677087f6c","survivor_venue":"98a45362-46ff-425f-b8e5-1934b278dfc6","duplicate_venue":"4692d01b-520f-4e61-a542-3f3549e38b4f"},
    {"base":"Giovinazzo","survivor_city":"4ad26154-a75a-48c1-805c-e0262033695d","duplicate_city":"a85e960d-9e95-4205-8feb-c1e7aef25579","survivor_venue":"795f7e57-8ea8-4514-92ca-be77893ace81","duplicate_venue":"13dde02e-c204-4609-afa7-8e4214b3cccc"},
    {"base":"Molfetta","survivor_city":"76055644-ded9-4fb1-b22e-d69ac8c4557b","duplicate_city":"f161592e-734a-49d7-9a25-8adfc93ade72","survivor_venue":"2a227bda-8eb2-4980-9c65-e98c7e5f0164","duplicate_venue":"4851e4bf-5b07-4435-992e-36b8be533c78"},
    {"base":"Montesilvano","survivor_city":"28175052-aef8-4727-a257-b37cbd74de9d","duplicate_city":"51a299ca-ee36-4835-8ff9-2b74fcccdb59","survivor_venue":"03c86942-0a47-494c-bf86-66c9821ae83b","duplicate_venue":"ef330947-6e54-48fd-859f-28a971a08864"},
    {"base":"Nago-Torbole","survivor_city":"51d936d4-4e67-4d41-bf1c-04cad55c7830","duplicate_city":"75c91cad-2c67-457b-8a64-61ee9612c079","survivor_venue":"4a70a534-0057-467c-a65f-0e8368f13b5b","duplicate_venue":"c1aaa6a0-e76e-4b3c-be38-7d59be0b8e61"},
    {"base":"Paderno Dugnano","survivor_city":"169d79ea-b10b-4f41-a543-cfda63b5a6c8","duplicate_city":"638d1992-638d-4fd9-97e5-f135911a6acf","survivor_venue":"bc1ac7ed-ac0e-462d-9db2-6296819165fd","duplicate_venue":"582b1017-f96a-4adc-a5a9-4c9a0d640bbd"},
    {"base":"Pozzuoli","survivor_city":"c5aae7bc-3088-463b-bb06-edb21e4a2a04","duplicate_city":"f009219a-820d-4bbb-9cb0-788256aa8513","survivor_venue":"0c99b224-0dff-4bd2-ba7e-4560b36a0f6d","duplicate_venue":"1e09b223-8520-4234-b617-038090eacdb1"},
    {"base":"Sant''Olcese","survivor_city":"8edd49a9-0ea0-48c5-bb88-5cc1be27be69","duplicate_city":"b7f2a5d7-247d-4cff-8671-11ad06d3bcc5","survivor_venue":"d39cb42b-7343-4002-9731-fec8ca505baa","duplicate_venue":"62dbffc9-40dc-4190-a7a4-b16e61bc9db3"},
    {"base":"Patti (ex Tindari)","survivor_city":"5f40bbf7-f476-49e7-9264-e76ce2f00f3f","duplicate_city":"6cfa8f99-791b-4feb-b38f-88b19c280836","survivor_venue":"8364ad5d-f770-4ea8-aab3-2cc11e50e32f","duplicate_venue":"0aba20f6-ee4d-4010-a4e3-e13805141af9"}
  ]';
  pair jsonb;
  remaining_city_refs int;
  remaining_venue_refs int;
  survivor_venue_check int;
  survivor_city_check int;
  total_events_repointed int := 0;
  total_deleted int := 0;
begin
  for pair in select * from jsonb_array_elements(pairs)
  loop
    -- 0. Verifica di precondizione: la survivor deve avere già un
    --    istat_code (assegnato dal seed), la duplicate no. Se non è
    --    più vero (dati cambiati da quando questo script è stato
    --    preparato), abortire l'intera transazione piuttosto che
    --    procedere su un'assunzione ormai falsa.
    if (select istat_code from public.cities where id = (pair->>'survivor_city')::uuid) is null then
      raise exception 'Precondizione violata per %: la survivor % non ha istat_code', pair->>'base', pair->>'survivor_city';
    end if;

    if (select istat_code from public.cities where id = (pair->>'duplicate_city')::uuid) is not null then
      raise exception 'Precondizione violata per %: la duplicate % ha già un istat_code (non è più un duplicato irrisolto)', pair->>'base', pair->>'duplicate_city';
    end if;

    -- 1. Ripunta gli eventi: city_id E venue_id insieme, nella stessa
    --    UPDATE (ogni evento di una città duplicata punta anche al
    --    suo unico venue duplicato, verificato nel dry-run).
    with updated as (
      update public.events
        set city_id = (pair->>'survivor_city')::uuid,
            venue_id = (pair->>'survivor_venue')::uuid
        where city_id = (pair->>'duplicate_city')::uuid
        returning 1
    )
    select count(*) into remaining_city_refs from updated;
    total_events_repointed := total_events_repointed + remaining_city_refs;

    -- 2. Verifica di sicurezza: nessun evento deve più puntare al
    --    duplicato (né per città né per venue).
    select count(*) into remaining_city_refs
      from public.events where city_id = (pair->>'duplicate_city')::uuid;
    if remaining_city_refs > 0 then
      raise exception 'Città duplicata % (%) ha ancora % eventi collegati dopo il repoint',
        pair->>'base', pair->>'duplicate_city', remaining_city_refs;
    end if;

    select count(*) into remaining_venue_refs
      from public.events where venue_id = (pair->>'duplicate_venue')::uuid;
    if remaining_venue_refs > 0 then
      raise exception 'Venue duplicato % (%) ha ancora % eventi collegati dopo il repoint',
        pair->>'base', pair->>'duplicate_venue', remaining_venue_refs;
    end if;

    -- 3. Elimina il venue e la città duplicati, ora orfani.
    delete from public.venues where id = (pair->>'duplicate_venue')::uuid;
    delete from public.cities where id = (pair->>'duplicate_city')::uuid;
    total_deleted := total_deleted + 2;

    -- 4. Verifica finale: survivor città e venue devono esistere
    --    ancora, invariati nell'identità (nessuna rinomina qui:
    --    il seed l'ha già fatta).
    select count(*) into survivor_city_check from public.cities where id = (pair->>'survivor_city')::uuid;
    select count(*) into survivor_venue_check from public.venues where id = (pair->>'survivor_venue')::uuid;
    if survivor_city_check <> 1 or survivor_venue_check <> 1 then
      raise exception 'Survivor mancante dopo il merge per %: city_check=%, venue_check=%',
        pair->>'base', survivor_city_check, survivor_venue_check;
    end if;
  end loop;

  raise notice 'Merge completato: % eventi ripuntati, % righe eliminate (16 città + 16 venue)', total_events_repointed, total_deleted;
end $$;

commit;

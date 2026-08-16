import type { SupabaseClient } from "@supabase/supabase-js";

import { slugify } from "@/lib/utils/slug";
import { matchCityNameToComune, type Comune } from "@/lib/importers/comuniMatcher";
import comuniDataset from "@/data/comuni-italiani.json";

const comuni = comuniDataset.comuni as Comune[];

export type VenueGeoInput = {
  cityName: string;
  venueName: string;
  countryCode: string;
  source: string;
  venueExternalId: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  /*
   * Codice ISTAT del comune, se la fonte lo fornisce già (priorità 1
   * di matching). Nessuna fonte oggi collegata (Ticketmaster non lo
   * fornisce) lo popola: il campo esiste per fonti future, resta
   * sempre null/assente in pratica adesso.
   */
  istatCode?: string | null;
};

export type ResolvedCityVenue = {
  /*
   * null quando il comune non è stato riconosciuto contro
   * l'anagrafica ufficiale (public.cities, popolata da ISTAT) — non
   * un errore, un esito legittimo. Il chiamante deve trattarlo come
   * "non risolto per questo giro", mai bloccare l'evento per questo.
   */
  cityId: string | null;
  venueId: string | null;
};

/*
 * Risolve città + venue per un evento importato, scoped alla fonte
 * che sta importando. Pensato per essere chiamato per ogni evento
 * durante l'import: un errore imprevisto (query fallita, non "comune
 * non trovato") deve ancora propagare come eccezione — è compito del
 * chiamante avvolgerlo in try/catch e trattarlo come "non risolto",
 * non come import fallito. Un "comune non trovato" invece non è
 * un'eccezione: è un risultato normale con cityId null.
 *
 * IMPORTANTE — cambiamento di comportamento rispetto alla versione
 * precedente: NON fa più get-or-create sulle città italiane.
 * public.cities è ora l'anagrafica ufficiale dei comuni (7.894 righe,
 * seed da ISTAT): se un comune non viene riconosciuto, NON viene mai
 * creato automaticamente. Il venue segue la stessa sorte — non ha
 * senso creare una venue "orfana" senza una città risolta, quindi se
 * cityId è null anche venueId lo è, senza nemmeno tentare il
 * matching venue.
 */
export async function resolveCityVenue(
  supabase: SupabaseClient,
  input: VenueGeoInput
): Promise<ResolvedCityVenue> {
  const cityId = await resolveCity(supabase, input);

  if (!cityId) {
    return { cityId: null, venueId: null };
  }

  const venueId = await resolveVenue(supabase, cityId, input);

  return { cityId, venueId };
}

/*
 * Esportata (oltre a resolveCityVenue) solo per permettere un test
 * isolato della sola risoluzione città, senza toccare mai venues —
 * non è pensata per essere chiamata altrove nell'app.
 */
export async function resolveCity(
  supabase: SupabaseClient,
  input: VenueGeoInput
): Promise<string | null> {
  /*
   * L'anagrafica caricata (data/comuni-italiani.json) copre solo i
   * comuni italiani. Un evento fuori dall'Italia non può essere
   * risolto contro questo dataset — prudente non tentare affatto
   * piuttosto che matchare per caso su un nome simile.
   */
  if (input.countryCode !== "IT") {
    console.error(
      "[resolveCityVenue] country_code non supportato dall'anagrafica comuni italiani:",
      JSON.stringify({ cityName: input.cityName, countryCode: input.countryCode })
    );

    return null;
  }

  // Priorità 1: codice ISTAT già noto dalla fonte (nessuna fonte
  // collegata oggi lo fornisce, ma se un giorno arriva si salta
  // interamente il matching per nome).
  if (input.istatCode) {
    const { data, error } = await supabase
      .from("cities")
      .select("id")
      .eq("istat_code", input.istatCode)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data.id as string;
    }

    console.error(
      "[resolveCityVenue] istat_code fornito dalla fonte ma non trovato in cities:",
      JSON.stringify({ istatCode: input.istatCode, cityName: input.cityName })
    );
    // continua con il matching per nome come fallback, non abortisce
  }

  const result = matchCityNameToComune(input.cityName, comuni);

  if (!result.comune) {
    console.error(
      "[resolveCityVenue] Comune non riconosciuto — city_id resterà null:",
      JSON.stringify({
        cityName: input.cityName,
        source: input.source,
        status: result.status,
        candidati:
          result.status === "AMBIGUO"
            ? result.candidates.map(
                (c) => `${c.name} (${c.province}, ${c.province_code})`
              )
            : undefined,
      })
    );

    return null;
  }

  const { data, error } = await supabase
    .from("cities")
    .select("id")
    .eq("istat_code", result.comune.istat_code)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    /*
     * Il comune esiste nell'anagrafica ISTAT caricata ma non (più)
     * come riga in cities con quell'istat_code — non dovrebbe
     * succedere (il seed li ha inseriti tutti), ma se succede non è
     * motivo per crearne una: si logga e si resta non risolti.
     */
    console.error(
      "[resolveCityVenue] Comune riconosciuto nell'anagrafica ma nessuna riga cities corrispondente — city_id resterà null:",
      JSON.stringify({
        cityName: input.cityName,
        comune: result.comune.name,
        istatCode: result.comune.istat_code,
      })
    );

    return null;
  }

  return data.id as string;
}

/*
 * Invariata rispetto a prima: matching per external_id, poi per
 * slug, self-healing dell'external_id quando lo slug matcha ma
 * l'external_id no. Continua a fare get-or-create per i venue (non
 * per le città) — un venue nuovo sotto una città reale già risolta
 * non pone lo stesso rischio di duplicazione dell'anagrafica
 * comunale, ed è il comportamento esplicitamente richiesto di
 * mantenere invariato.
 */
async function resolveVenue(
  supabase: SupabaseClient,
  cityId: string,
  input: VenueGeoInput
): Promise<string> {
  if (input.venueExternalId) {
    const { data: byExternalId, error: externalIdError } = await supabase
      .from("venues")
      .select("id")
      .eq("city_id", cityId)
      .eq(`external_ids->>${input.source}`, input.venueExternalId)
      .maybeSingle();

    if (externalIdError) {
      throw externalIdError;
    }

    if (byExternalId) {
      return byExternalId.id as string;
    }
  }

  const slug = slugify(input.venueName);

  const { data: existing, error: selectError } = await supabase
    .from("venues")
    .select("id, external_ids")
    .eq("city_id", cityId)
    .eq("slug", slug)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existing) {
    if (
      input.venueExternalId &&
      existing.external_ids?.[input.source] !== input.venueExternalId
    ) {
      await supabase
        .from("venues")
        .update({
          external_ids: {
            ...existing.external_ids,
            [input.source]: input.venueExternalId,
          },
        })
        .eq("id", existing.id);
    }

    return existing.id as string;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("venues")
    .insert({
      city_id: cityId,
      name: input.venueName,
      slug,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      source: input.source,
      external_ids: input.venueExternalId
        ? { [input.source]: input.venueExternalId }
        : {},
    })
    .select("id")
    .single();

  if (!insertError) {
    return inserted.id as string;
  }

  const { data: afterConflict, error: refetchError } = await supabase
    .from("venues")
    .select("id")
    .eq("city_id", cityId)
    .eq("slug", slug)
    .single();

  if (refetchError || !afterConflict) {
    throw insertError;
  }

  return afterConflict.id as string;
}

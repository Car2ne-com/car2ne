/*
 * Import relativo (non "@/lib/utils/slug") deliberato: questo modulo
 * deve poter essere eseguito anche standalone con
 * `node --experimental-strip-types` per i test isolati, senza un
 * bundler che risolva l'alias "@/". Stesso identico slugify() usato
 * ovunque nel resto del progetto, solo importato diversamente.
 */
import { slugify } from "../utils/slug";

/*
 * Slug per un evento Ticketmaster: titolo + città + external_id
 * COMPLETO (non troncato). Verificato sui 406 external_id reali oggi
 * in produzione: lunghi solo 13-14 caratteri totali, con appena 3
 * prefissi distinti a 8 caratteri e 46 a 12 — nessuna lunghezza di
 * troncamento intermedia è sicura, va usato per intero. Poiché
 * (source, external_id) è già garantito univoco lato Ticketmaster
 * (ed è la stessa chiave usata da decideDedup), usare l'id completo
 * garantisce l'unicità dello slug per costruzione, non per
 * probabilità.
 */
export function buildTicketmasterEventSlug(
  title: string,
  city: string,
  externalId: string
): string {
  return slugify(`${title}-${city}-${externalId}`);
}

/*
 * Hash deterministico (mai casuale): stesso input, sempre stesso
 * output. Usato SOLO come rete di sicurezza nel caso residuo — mai
 * osservato, ma non escludibile per costruzione — in cui due
 * external_id diversi producano lo stesso slug dopo slugify() (es.
 * differiscono solo per maiuscole/minuscole, che slugify() annulla).
 */
function deterministicHash(value: string): string {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0;
  }

  return (hash >>> 0).toString(36);
}

/*
 * Slug alternativo, deterministico, da usare solo quando baseSlug
 * risulta già assegnato a un evento con un external_id diverso.
 * Chiamato con lo stesso externalId produce sempre lo stesso
 * risultato — mai un valore che cambia da un import all'altro.
 */
export function buildFallbackSlug(
  baseSlug: string,
  externalId: string
): string {
  return `${baseSlug}-${deterministicHash(externalId)}`;
}

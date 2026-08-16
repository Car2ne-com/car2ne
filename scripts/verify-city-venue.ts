/*
 * Verifica statica/runtime della chiave di dedup città usata da
 * lib/geo/resolveCityVenue.ts (stripProvinceSuffix + normalizeForMatch
 * + CITY_ALIASES + slugify), senza toccare il database: dimostra che
 * varianti Ticketmaster diverse dello stesso comune collassano sullo
 * stesso slug, che è la garanzia reale di cui dipende il resolver.
 *
 * Il progetto non ha un test runner configurato (nessun jest/vitest
 * in package.json): eseguito direttamente con il supporto TypeScript
 * nativo di Node (Node 22+), nessuna dipendenza aggiuntiva.
 *
 *   node scripts/verify-city-venue.ts
 *
 * Il round-trip completo contro il database reale (get-or-create,
 * conflitti di unicità, dedup venue via external_id) è verificato a
 * runtime nella Fase 11 tramite l'app stessa (vedi report finale).
 */

import { normalizeForMatch, stripProvinceSuffix } from "../lib/geo/normalize.ts";
import { CITY_ALIASES } from "../lib/geo/cityAliases.ts";
import { slugify } from "../lib/utils/slug.ts";

let passed = 0;
let failed = 0;

function assertEqual(actual: unknown, expected: unknown, label: string) {
  if (actual === expected) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.error(
      `  FAIL  ${label}\n        atteso:  ${JSON.stringify(expected)}\n        ottenuto: ${JSON.stringify(actual)}`
    );
  }
}

/*
 * Riproduce esattamente la pipeline usata da resolveCity() in
 * resolveCityVenue.ts, per verificare la chiave di dedup finale
 * (lo slug) senza dover mockare Supabase.
 */
function resolveCitySlug(rawName: string): { canonicalName: string; slug: string } {
  const nameWithoutProvince = stripProvinceSuffix(rawName);
  const alias = CITY_ALIASES[normalizeForMatch(nameWithoutProvince)];
  const canonicalName = alias ?? nameWithoutProvince;
  const slug = slugify(canonicalName);

  return { canonicalName, slug };
}

console.log("\n== stripProvinceSuffix ==");
assertEqual(
  stripProvinceSuffix("Segrate (Milano)"),
  "Segrate",
  'rimuove la provincia tra parentesi: "Segrate (Milano)" -> "Segrate"'
);
assertEqual(
  stripProvinceSuffix("Roma"),
  "Roma",
  'non tocca un nome senza provincia: "Roma" -> "Roma"'
);

console.log("\n== normalizeForMatch ==");
assertEqual(
  normalizeForMatch("Città"),
  "citta",
  'lowercase + rimozione diacritici: "Città" -> "citta"'
);
assertEqual(
  normalizeForMatch("  Milano   Centro  "),
  "milano centro",
  "collassa spazi multipli e trim"
);

console.log("\n== slugify ==");
assertEqual(slugify("Città"), "citta", 'slugify("Città") -> "citta"');
assertEqual(
  slugify("Segrate"),
  "segrate",
  'slugify("Segrate") -> "segrate"'
);

console.log("\n== CITY_ALIASES copertura minima ==");
assertEqual(CITY_ALIASES["milan"], "Milano", 'alias "milan" -> "Milano"');
assertEqual(CITY_ALIASES["rome"], "Roma", 'alias "rome" -> "Roma"');

console.log(
  "\n== Dedup città: varianti diverse devono produrre lo stesso slug =="
);

const segrate1 = resolveCitySlug("Segrate (Milano)");
const segrate2 = resolveCitySlug("Segrate");

assertEqual(
  segrate1.slug,
  segrate2.slug,
  '"Segrate (Milano)" e "Segrate" collassano sullo stesso slug'
);
assertEqual(segrate1.slug, "segrate", "slug finale atteso: segrate");

const milan1 = resolveCitySlug("Milan");
const milan2 = resolveCitySlug("Milano");

assertEqual(
  milan1.canonicalName,
  "Milano",
  'alias EN->IT applicato: "Milan" -> nome canonico "Milano"'
);
assertEqual(
  milan1.slug,
  milan2.slug,
  '"Milan" e "Milano" collassano sullo stesso slug'
);

const torino1 = resolveCitySlug("Torino (TO)");
const torino2 = resolveCitySlug("Turin");

assertEqual(
  torino1.slug,
  torino2.slug,
  '"Torino (TO)" e "Turin" (alias) collassano sullo stesso slug'
);

console.log(
  `\n${passed} passati, ${failed} falliti su ${passed + failed} controlli.\n`
);

if (failed > 0) {
  process.exit(1);
}

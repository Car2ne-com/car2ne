import "server-only";

import { it } from "./dictionaries/it";
import { en } from "./dictionaries/en";
import type { Locale } from "./locales";

const dictionaries = { it, en };

export type Dictionary = typeof it;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale];
}

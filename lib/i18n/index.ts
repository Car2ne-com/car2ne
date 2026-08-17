import "server-only";

import { getLocale } from "./getLocale";
import { getDictionary } from "./getDictionary";

export async function getTranslations() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return { locale, dict };
}

export { getLocale } from "./getLocale";
export { getDictionary } from "./getDictionary";
export type { Dictionary } from "./getDictionary";
export { locales, defaultLocale, isLocale, LOCALE_COOKIE } from "./locales";
export type { Locale } from "./locales";

@AGENTS.md

# Internationalization (i18n)

Car2ne is bilingual (Italian default, English). All **new pages and components must ship translated from the start** — do not hardcode user-facing strings in a single language.

- URLs are not locale-prefixed. The active locale is stored in the `NEXT_LOCALE` cookie and read server-side — see `lib/i18n/`.
- Dictionaries live in `lib/i18n/dictionaries/{it,en}/`, split by namespace (`layout`, `home`, `events`, ...). Add new keys to **both** locales; the `en` namespace files are typed against the `it` ones (`(typeof it)["namespace"]`), so a missing key fails the build.
- Server Components: call `const { locale, dict } = await getTranslations();` from `@/lib/i18n` and read strings from `dict`.
- Client Components cannot read the cookie/dictionary directly — pass the needed `dict` slice (and `locale` if needed for date/number formatting) down as props from the nearest Server Component ancestor.
- The language switcher (`components/layout/LanguageSwitcher.tsx`) flips the cookie via a server action and calls `router.refresh()`, which re-renders Server Components with the new locale and re-propagates translated props to their Client Component children.
- Register a new namespace by creating matching `dictionaries/it/<name>.ts` and `dictionaries/en/<name>.ts` files and adding them to both `dictionaries/it/index.ts` and `dictionaries/en/index.ts`.
- Dictionary values passed as props to a Client Component must stay plain data (strings, numbers, arrays, objects) — **functions cannot cross the Server→Client boundary** (RSC throws at render). For pluralized/interpolated strings, store `"{count}"` placeholder templates (e.g. `unreadMessageSingular`/`unreadMessagePlural`) and do the `.replace()` inside the Client Component instead of shipping a formatter function from the dictionary.

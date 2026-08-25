# Car2ne

Piattaforma di car-sharing verso eventi (concerti, festival, sport): un utente cerca un evento, offre o richiede un passaggio ("ride") per raggiungerlo, chatta con i co-passeggeri e lascia una recensione a fine viaggio. Vedi [docs/vision.md](docs/vision.md) per la visione di prodotto completa.

## Stack

- [Next.js](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Supabase](https://supabase.com) (Postgres, Auth, Storage) — schema e migrazioni in `supabase/migrations/`
- Tailwind CSS, componenti UI in `components/ui/`
- Vitest per i test unitari
- i18n IT/EN tipizzato — vedi `lib/i18n/` e le convenzioni in `CLAUDE.md`

## Getting Started

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Script utili

```bash
npm run dev        # server di sviluppo
npm run build       # build di produzione
npm run lint         # ESLint
npm run typecheck  # controllo tipi TypeScript
npm run test          # test una tantum (Vitest)
npm run test:watch  # test in watch mode
```

## Struttura

- `app/` — route App Router (pagine pubbliche, `app/dashboard/`, `app/admin/`, `app/api/`)
- `components/` — componenti React, incluso il design system in `components/ui/`
- `lib/` — logica condivisa (auth, i18n, importer eventi, utility)
- `supabase/migrations/` — schema del database, numerate progressivamente
- `docs/` — documentazione di prodotto e architettura

Prima di scrivere codice, leggi `AGENTS.md` e `CLAUDE.md` per le convenzioni specifiche del progetto (versione di Next.js con breaking changes rispetto ai training data, regole i18n, ecc.).

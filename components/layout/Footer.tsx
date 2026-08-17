import Link from "next/link";

import Logo from "./Logo";

import { getCurrentYear } from "@/lib/utils/date";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white/60">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo />

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Car2ne mette in contatto persone
              che vanno allo stesso evento, per
              viaggiare insieme e dividere le
              spese.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Prodotto
              </h3>

              <ul className="mt-4 space-y-3 text-sm text-slate-500">
                <li>
                  <Link
                    href="/events"
                    className="transition hover:text-emerald-600"
                  >
                    Eventi
                  </Link>
                </li>

                <li>
                  <Link
                    href="/offer-ride"
                    className="transition hover:text-emerald-600"
                  >
                    Offri un passaggio
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Account
              </h3>

              <ul className="mt-4 space-y-3 text-sm text-slate-500">
                <li>
                  <Link
                    href="/login"
                    className="transition hover:text-emerald-600"
                  >
                    Accedi
                  </Link>
                </li>

                <li>
                  <Link
                    href="/register"
                    className="transition hover:text-emerald-600"
                  >
                    Registrati
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Legale
              </h3>

              <ul className="mt-4 space-y-3 text-sm text-slate-500">
                <li>
                  <Link
                    href="/privacy"
                    className="transition hover:text-emerald-600"
                  >
                    Privacy Policy
                  </Link>
                </li>

                <li>
                  <Link
                    href="/termini"
                    className="transition hover:text-emerald-600"
                  >
                    Termini e Condizioni
                  </Link>
                </li>

                <li>
                  <Link
                    href="/cookie-policy"
                    className="transition hover:text-emerald-600"
                  >
                    Cookie Policy
                  </Link>
                </li>

                <li>
                  <Link
                    href="/community-guidelines"
                    className="transition hover:text-emerald-600"
                  >
                    Community Guidelines
                  </Link>
                </li>

                <li>
                  <Link
                    href="/segnala-un-problema"
                    className="transition hover:text-emerald-600"
                  >
                    Segnala un problema
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-6 text-sm text-slate-400">
          © {getCurrentYear()} Car2ne. Tutti
          i diritti riservati.
        </div>
      </div>
    </footer>
  );
}

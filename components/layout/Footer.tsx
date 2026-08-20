import Link from "next/link";

import Logo from "./Logo";

import { getCurrentYear } from "@/lib/utils/date";
import { getTranslations } from "@/lib/i18n";

export default async function Footer() {
  const { dict } = await getTranslations();
  const t = dict.layout.footer;

  return (
    <footer className="mt-24 border-t border-border bg-background/60">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo />

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {t.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t.productHeading}
              </h3>

              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/events"
                    className="transition hover:text-primary"
                  >
                    {t.events}
                  </Link>
                </li>

                <li>
                  <Link
                    href="/offer-ride"
                    className="transition hover:text-primary"
                  >
                    {t.offerRide}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t.accountHeading}
              </h3>

              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/login"
                    className="transition hover:text-primary"
                  >
                    {t.login}
                  </Link>
                </li>

                <li>
                  <Link
                    href="/register"
                    className="transition hover:text-primary"
                  >
                    {t.register}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t.legalHeading}
              </h3>

              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/privacy"
                    className="transition hover:text-primary"
                  >
                    {t.privacyPolicy}
                  </Link>
                </li>

                <li>
                  <Link
                    href="/termini"
                    className="transition hover:text-primary"
                  >
                    {t.termsAndConditions}
                  </Link>
                </li>

                <li>
                  <Link
                    href="/cookie-policy"
                    className="transition hover:text-primary"
                  >
                    {t.cookiePolicy}
                  </Link>
                </li>

                <li>
                  <Link
                    href="/community-guidelines"
                    className="transition hover:text-primary"
                  >
                    {t.communityGuidelines}
                  </Link>
                </li>

                <li>
                  <Link
                    href="/segnala-un-problema"
                    className="transition hover:text-primary"
                  >
                    {t.reportProblem}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground/70">
          © {getCurrentYear()} Car2ne. {t.rightsReserved}
        </div>
      </div>
    </footer>
  );
}

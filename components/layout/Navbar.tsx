import Link from "next/link";

import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import NavbarAuth from "./NavbarAuth";
import NotificationBell from "./NotificationBell";
import LanguageSwitcher from "./LanguageSwitcher";

import { getTranslations } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
  const { locale, dict } = await getTranslations();
  const { nav, languageSwitcher, notifications } = dict.layout;

  /*
   * NotificationBell è un client component con la sua auth/realtime:
   * per un visitatore anonimo non ha nulla da mostrare (ritornerebbe
   * null dopo il mount), ma verrebbe comunque spedito e idratato su
   * ogni pagina pubblica. Il check qui è server-side ed economico
   * (Next deduplica automaticamente le fetch identiche nella stessa
   * request, incluso il getUser() già fatto da NavbarAuth).
   */
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4 sm:pt-[max(1rem,env(safe-area-inset-top))]">
      <div
        className="
          relative
          flex
          h-16
          w-full
          max-w-7xl
          items-center
          justify-between
          rounded-2xl
          border
          border-border
          bg-background/95
          px-3
          shadow-[0_10px_40px_rgba(15,23,42,.06)]
          sm:h-18
          sm:px-5
          md:px-6
        "
      >

        {/* Logo */}

        <Logo />

        {/* Menu */}

        <nav
          className="
            hidden
            items-center
            gap-3
            whitespace-nowrap
            text-xs
            font-medium
            text-muted-foreground
            sm:gap-5
            sm:text-sm
            md:flex
            md:gap-8
            md:text-[15px]
          "
        >
          <Link
            href="/"
            className="transition-colors hover:text-primary"
          >
            {nav.home}
          </Link>

          <Link
            href="/events"
            className="transition-colors hover:text-primary"
          >
            {nav.events}
          </Link>

          <Link
            href="/offer-ride"
            className="transition-colors hover:text-primary"
          >
            {nav.offerRide}
          </Link>
        </nav>

        {/* Azioni utente */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-1.5
            sm:gap-2
            md:gap-3
          "
        >
          <div className="hidden md:block">
            <LanguageSwitcher locale={locale} srLabel={languageSwitcher.label} />
          </div>

          {user && (
            <NotificationBell locale={locale} dict={notifications} />
          )}

          <NavbarAuth />

          <MobileMenu
            dict={nav}
            social={{
              heading: dict.layout.footer.socialHeading,
              instagram: dict.layout.footer.instagram,
              tiktok: dict.layout.footer.tiktok,
            }}
            ariaOpen={dict.layout.mobileMenu.open}
            ariaClose={dict.layout.mobileMenu.close}
            locale={locale}
            languageSwitcherLabel={languageSwitcher.label}
          />
        </div>

      </div>
    </header>
  );
}

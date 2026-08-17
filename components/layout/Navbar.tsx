import Link from "next/link";

import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import NavbarAuth from "./NavbarAuth";
import NotificationBell from "./NotificationBell";
import LanguageSwitcher from "./LanguageSwitcher";

import { getTranslations } from "@/lib/i18n";

export default async function Navbar() {
  const { locale, dict } = await getTranslations();
  const { nav, languageSwitcher, notifications } = dict.layout;

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-2 pt-2 sm:px-4 sm:pt-4">
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
          border-white/40
          bg-white/70
          px-3
          shadow-[0_10px_40px_rgba(15,23,42,.06)]
          backdrop-blur-2xl
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
            text-slate-600
            sm:gap-5
            sm:text-sm
            md:flex
            md:gap-8
            md:text-[15px]
          "
        >
          <Link
            href="/"
            className="transition-colors hover:text-emerald-600"
          >
            {nav.home}
          </Link>

          <Link
            href="/events"
            className="transition-colors hover:text-emerald-600"
          >
            {nav.events}
          </Link>

          <Link
            href="/offer-ride"
            className="transition-colors hover:text-emerald-600"
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
          <LanguageSwitcher locale={locale} srLabel={languageSwitcher.label} />

          <NotificationBell locale={locale} dict={notifications} />

          <NavbarAuth />

          <MobileMenu dict={nav} ariaOpen={dict.layout.mobileMenu.open} ariaClose={dict.layout.mobileMenu.close} />
        </div>

      </div>
    </header>
  );
}
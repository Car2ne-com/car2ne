import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import NavbarAuth from "./NavbarAuth";
import NavbarContainer from "./NavbarContainer";
import NavLinks from "./NavLinks";
import NotificationBell from "./NotificationBell";
import LanguageMenu from "./LanguageMenu";

import { getTranslations } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
  const { locale, dict } = await getTranslations();
  const { nav, auth, languageSwitcher, notifications, footer } = dict.layout;

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
    <NavbarContainer>
      <Logo />

      <NavLinks dict={nav} />

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden md:block">
          <LanguageMenu locale={locale} srLabel={languageSwitcher.label} />
        </div>

        {user && <NotificationBell locale={locale} dict={notifications} />}

        <NavbarAuth />

        <MobileMenu
          dict={nav}
          auth={user ? null : { login: auth.login }}
          social={{
            heading: footer.socialHeading,
            instagram: footer.instagram,
            tiktok: footer.tiktok,
          }}
          ariaOpen={dict.layout.mobileMenu.open}
          ariaClose={dict.layout.mobileMenu.close}
          locale={locale}
          languageSwitcherLabel={languageSwitcher.label}
        />
      </div>
    </NavbarContainer>
  );
}

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";

import UserMenu from "./UserMenu";

export default async function NavbarAuth() {
  const supabase = await createClient();
  const { dict } = await getTranslations();
  const { auth, userMenu } = dict.layout;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        {/* Su mobile "Accedi" vive nel menu (MobileMenu) per non
            affollare la pill: qui resta solo da sm in su. */}
        <Link href="/login" className="hidden sm:block">
          <Button
            variant="ghost"
            className="h-10 rounded-full px-4 text-sm"
          >
            {auth.login}
          </Button>
        </Link>

        <Link href="/register">
          <Button className="h-10 rounded-full px-4 text-sm shadow-sm">
            {auth.register}
          </Button>
        </Link>
      </div>
    );
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("name, role, avatar_url, surname")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error(
      "Errore recupero profilo navbar:",
      error
    );
  }

  const name =
    profile?.name ??
    user.email?.split("@")[0] ??
    "Utente";

  const surname =
    profile?.surname ?? "";

  const avatarUrl =
    profile?.avatar_url ?? null;

  const isAdmin =
    profile?.role === "admin";

  return (
    <UserMenu
      name={name}
      surname={surname}
      avatarUrl={avatarUrl}
      isAdmin={isAdmin}
      dict={userMenu}
    />
  );
}
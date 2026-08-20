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
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <Link href="/login">
          <Button
            variant="outline"
            className="rounded-xl px-2.5 text-xs sm:px-5 sm:text-sm"
          >
            {auth.login}
          </Button>
        </Link>

        <Link href="/register">
          <Button className="rounded-xl px-2.5 text-xs shadow-lg sm:px-5 sm:text-sm">
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
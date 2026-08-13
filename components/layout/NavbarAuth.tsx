import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import UserMenu from "./UserMenu";

export default async function NavbarAuth() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <Link href="/login">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 bg-white px-2.5 text-xs hover:bg-slate-50 sm:px-5 sm:text-sm"
          >
            Accedi
          </Button>
        </Link>

        <Link href="/register">
          <Button className="rounded-xl bg-emerald-500 px-2.5 text-xs shadow-lg hover:bg-emerald-600 sm:px-5 sm:text-sm">
            Registrati
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
    />
  );
}
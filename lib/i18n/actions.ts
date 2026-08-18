"use server";

import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { isLocale, LOCALE_COOKIE, type Locale } from "./locales";

export async function setLocaleAction(locale: Locale) {
  if (!isLocale(locale)) return;

  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  /*
   * Salvata anche su profiles: le email innescate dal database
   * (es. notifiche di prenotazione via Edge Function) non hanno
   * accesso al cookie del browser, quindi serve una preferenza
   * di lingua persistita per poterle tradurre.
   */
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from("profiles")
      .update({ locale })
      .eq("id", user.id);
  }
}

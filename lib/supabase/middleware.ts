import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  TRUSTED_DEVICE_COOKIE,
  isDeviceTrusted,
} from "@/lib/utils/trustedDevice";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },

        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });

          response = NextResponse.next({
            request,
          });

          response.cookies.set({
            name,
            value,
            ...options,
          });
        },

        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });

          response = NextResponse.next({
            request,
          });

          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * ==============================
   * GATE MFA (AAL2)
   * ==============================
   *
   * Se l'utente ha attivato il 2FA ma la sessione
   * corrente non l'ha ancora verificato, blocchiamo
   * l'accesso alle aree autenticate finché non
   * completa la verifica.
   */

  const pathname = request.nextUrl.pathname;

  const isProtectedPath = PROTECTED_PREFIXES.some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(`${prefix}/`)
  );

  if (user && isProtectedPath) {
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (
      aal &&
      aal.nextLevel === "aal2" &&
      aal.nextLevel !== aal.currentLevel
    ) {
      const trustedToken = request.cookies.get(
        TRUSTED_DEVICE_COOKIE
      )?.value;

      const trusted = await isDeviceTrusted(
        supabase,
        user.id,
        trustedToken
      );

      if (!trusted) {
        const redirectUrl = new URL(
          "/mfa-challenge",
          request.url
        );

        redirectUrl.searchParams.set(
          "next",
          pathname
        );

        return NextResponse.redirect(
          redirectUrl
        );
      }
    }
  }

  return response;
}

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/chat",
  "/profile",
];
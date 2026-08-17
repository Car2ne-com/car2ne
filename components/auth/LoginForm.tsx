"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { it } from "@/lib/i18n/dictionaries/it";

type AuthDict = (typeof it)["auth"];

type Props = {
  dict: AuthDict;
};

export default function LoginForm({ dict }: Props) {
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [oauthLoading, setOauthLoading] =
    useState<"google" | null>(null);

  const [mfaFactorId, setMfaFactorId] =
    useState<string | null>(null);

  const [mfaCode, setMfaCode] = useState("");
  const [mfaLoading, setMfaLoading] =
    useState(false);

  const [trustDevice, setTrustDevice] =
    useState(false);

  /*
   * ==============================
   * LOGIN EMAIL / PASSWORD
   * ==============================
   */

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(dict.loginForm.errors.emptyEmail);
      return;
    }

    if (!password) {
      toast.error(dict.loginForm.errors.emptyPassword);
      return;
    }

    setLoading(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      setLoading(false);

      console.error(
        "Errore login:",
        error
      );

      toast.error(error.message);
      return;
    }

    const user = data.user;

    if (!user) {
      setLoading(false);
      toast.error(dict.loginForm.errors.userFetchFailed);
      return;
    }

    /*
     * ==============================
     * VERIFICA MFA (AAL2)
     * ==============================
     */

    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (
      aal &&
      aal.nextLevel === "aal2" &&
      aal.nextLevel !== aal.currentLevel
    ) {
      /*
       * Se questo dispositivo è già stato
       * segnato come fidato negli ultimi 14
       * giorni, saltiamo la richiesta del
       * codice.
       */

      const trustedResponse = await fetch(
        "/api/mfa/trusted-device"
      );

      const trustedData =
        await trustedResponse
          .json()
          .catch(() => ({
            trusted: false,
          }));

      if (trustedData.trusted) {
        await finishLoginRedirect();
        return;
      }

      const { data: factors } =
        await supabase.auth.mfa.listFactors();

      const verifiedTotp =
        factors?.totp.find(
          (factor) =>
            factor.status === "verified"
        );

      setLoading(false);
      setMfaFactorId(
        verifiedTotp?.id ?? null
      );
      return;
    }

    await finishLoginRedirect();
  }

  /*
   * ==============================
   * VERIFICA CODICE MFA
   * ==============================
   */

  async function handleMfaVerify(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!mfaFactorId) {
      toast.error(dict.loginForm.errors.noMfaMethod);
      return;
    }

    if (mfaCode.trim().length !== 6) {
      toast.error(dict.loginForm.errors.mfaCodeLength);
      return;
    }

    setMfaLoading(true);

    const {
      data: challenge,
      error: challengeError,
    } = await supabase.auth.mfa.challenge({
      factorId: mfaFactorId,
    });

    if (challengeError) {
      setMfaLoading(false);

      console.error(
        "Errore challenge MFA:",
        challengeError
      );

      toast.error(challengeError.message);
      return;
    }

    const { error: verifyError } =
      await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.id,
        code: mfaCode.trim(),
      });

    if (verifyError) {
      setMfaLoading(false);

      console.error(
        "Errore verifica MFA:",
        verifyError
      );

      toast.error(dict.loginForm.errors.invalidMfaCode);
      setMfaCode("");
      return;
    }

    if (trustDevice) {
      await fetch(
        "/api/mfa/trusted-device",
        { method: "POST" }
      ).catch((error) => {
        console.error(
          "Errore salvataggio dispositivo fidato:",
          error
        );
      });
    }

    await finishLoginRedirect();
    setMfaLoading(false);
  }

  /*
   * ==============================
   * REDIRECT POST LOGIN
   * ==============================
   */

  async function finishLoginRedirect() {
    /*
     * ==============================
     * RECUPERO UTENTE + PROFILO
     * ==============================
     */

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      toast.error(dict.loginForm.errors.userFetchFailed);
      return;
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      setLoading(false);

      console.error(
        "Errore recupero profilo:",
        profileError
      );

      toast.error(profileError.message);
      return;
    }

    setLoading(false);

    /*
     * ==============================
     * REDIRECT PERSONALIZZATO
     * ==============================
     */

    const searchParams =
      new URLSearchParams(
        window.location.search
      );

    const redirectTo =
      searchParams.get("redirect");

    if (redirectTo) {
      router.push(redirectTo);
      return;
    }

    /*
     * ==============================
     * REDIRECT DEFAULT
     * ==============================
     */

    router.push("/dashboard");
  }

  /*
   * ==============================
   * GOOGLE / APPLE
   * ==============================
   */

  async function handleOAuth(
    provider: "google"
  ) {
    if (
      loading ||
      oauthLoading
    ) {
      return;
    }

    setOauthLoading(provider);

    /*
     * Manteniamo l'eventuale redirect
     * ricevuto dalla pagina di login.
     */

    const searchParams =
      new URLSearchParams(
        window.location.search
      );

    const redirectTo =
      searchParams.get("redirect");

    /*
     * Lo passiamo alla callback OAuth
     * tramite il parametro next.
     */

    const callbackUrl =
      new URL(
        "/auth/callback",
        window.location.origin
      );

    if (redirectTo) {
      callbackUrl.searchParams.set(
        "next",
        redirectTo
      );
    }

    const {
      error,
    } =
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo:
            callbackUrl.toString(),
        },
      });

    if (error) {
      console.error(
        `Errore OAuth ${provider}:`,
        error
      );

      setOauthLoading(null);

      toast.error(error.message);
    }
  }

  /*
   * ==============================
   * RENDER
   * ==============================
   */

  if (mfaFactorId) {
    return (
      <form
        onSubmit={handleMfaVerify}
        className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {dict.loginForm.mfaTitle}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {dict.loginForm.mfaSubtitle}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            {dict.loginForm.mfaCodeLabel}
          </label>

          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={mfaCode}
            onChange={(e) =>
              setMfaCode(
                e.target.value.replace(
                  /\D/g,
                  ""
                )
              )
            }
            maxLength={6}
            disabled={mfaLoading}
            className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-center text-lg tracking-[0.5em] outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={trustDevice}
            onChange={(e) =>
              setTrustDevice(
                e.target.checked
              )
            }
            disabled={mfaLoading}
            className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
          />
          {dict.loginForm.trustDevice}
        </label>

        <Button
          type="submit"
          disabled={mfaLoading}
          className="h-12 w-full rounded-2xl bg-emerald-500 text-base font-semibold hover:bg-emerald-600"
        >
          {mfaLoading ? dict.loginForm.mfaVerifying : dict.loginForm.mfaVerifyButton}
        </Button>

        <button
          type="button"
          onClick={() => {
            setMfaFactorId(null);
            setMfaCode("");
          }}
          className="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          {dict.common.backToLogin}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleLogin}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      {/* Email */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          {dict.common.emailLabel}
        </label>

        <input
          type="email"
          placeholder={dict.common.emailPlaceholder}
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          disabled={
            loading ||
            !!oauthLoading
          }
          autoComplete="email"
          className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
      </div>

      {/* Password */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          {dict.common.passwordLabel}
        </label>

        <div className="relative">
          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="••••••••"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            disabled={
              loading ||
              !!oauthLoading
            }
            autoComplete="current-password"
            className="h-14 w-full rounded-2xl border border-slate-200 px-4 pr-12 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) => !current
              )
            }
            disabled={
              loading ||
              !!oauthLoading
            }
            aria-label={
              showPassword
                ? dict.common.hidePassword
                : dict.common.showPassword
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-emerald-600"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Ricordami / Password dimenticata */}

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          <input
            type="checkbox"
            disabled={
              loading ||
              !!oauthLoading
            }
            className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
          />

          {dict.loginForm.rememberMe}
        </label>

        <Link
          href="/forgot-password"
          className="font-medium text-emerald-600 hover:text-emerald-700"
        >
          {dict.loginForm.forgotPassword}
        </Link>
      </div>

      {/* Login */}

      <Button
        type="submit"
        disabled={
          loading ||
          !!oauthLoading
        }
        className="h-12 w-full rounded-2xl bg-emerald-500 text-base font-semibold hover:bg-emerald-600"
      >
        {loading
          ? dict.loginForm.loggingIn
          : dict.loginForm.loginButton}
      </Button>

      {/* Separatore */}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>

        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm text-slate-500">
            {dict.common.or}
          </span>
        </div>
      </div>

      {/* Google */}

      <Button
        type="button"
        variant="outline"
        disabled={
          loading ||
          !!oauthLoading
        }
        onClick={() =>
          handleOAuth("google")
        }
        className="h-12 w-full rounded-2xl"
      >
        {oauthLoading ===
        "google"
          ? dict.common.connecting
          : dict.common.continueWithGoogle}
      </Button>

      {/* Registrazione */}

      <p className="text-center text-sm text-slate-600">
        {dict.loginForm.noAccount}{" "}

        <Link
          href="/register"
          className="font-semibold text-emerald-600 hover:text-emerald-700"
        >
          {dict.loginForm.signUpLink}
        </Link>
      </p>
    </form>
  );
}
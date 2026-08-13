"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Props = {
  next: string | null;
};

export default function MfaChallengeForm({
  next,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [factorId, setFactorId] = useState<
    string | null
  >(null);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] =
    useState(false);

  const [trustDevice, setTrustDevice] =
    useState(false);

  useEffect(() => {
    async function loadFactor() {
      const { data, error } =
        await supabase.auth.mfa.listFactors();

      if (error) {
        console.error(
          "Errore recupero fattori MFA:",
          error
        );

        return;
      }

      const verifiedTotp =
        data.totp.find(
          (factor) =>
            factor.status === "verified"
        );

      setFactorId(
        verifiedTotp?.id ?? null
      );
    }

    loadFactor();
  }, [supabase]);

  async function handleVerify(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!factorId) {
      toast.error(
        "Nessun metodo di autenticazione a due fattori trovato."
      );

      return;
    }

    if (code.trim().length !== 6) {
      toast.error("Inserisci il codice a 6 cifre.");
      return;
    }

    setLoading(true);

    const {
      data: challenge,
      error: challengeError,
    } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError) {
      setLoading(false);

      console.error(
        "Errore challenge MFA:",
        challengeError
      );

      toast.error(challengeError.message);
      return;
    }

    const { error: verifyError } =
      await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: code.trim(),
      });

    setLoading(false);

    if (verifyError) {
      console.error(
        "Errore verifica MFA:",
        verifyError
      );

      toast.error(
        "Codice non valido. Riprova."
      );

      setCode("");
      return;
    }

    if (trustDevice) {
      await fetch(
        "/api/mfa/trusted-device",
        { method: "POST" }
      ).catch((trustError) => {
        console.error(
          "Errore salvataggio dispositivo fidato:",
          trustError
        );
      });
    }

    const redirectTo =
      next &&
      next.startsWith("/") &&
      !next.startsWith("//")
        ? next
        : "/dashboard";

    router.push(redirectTo);
    router.refresh();
  }

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <form
      onSubmit={handleVerify}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Codice di verifica
        </label>

        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          value={code}
          onChange={(e) =>
            setCode(
              e.target.value.replace(
                /\D/g,
                ""
              )
            )
          }
          maxLength={6}
          disabled={loading}
          className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-center text-lg tracking-[0.5em] outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
        />

        <p className="mt-2 text-xs text-slate-500">
          Apri la tua app di autenticazione e
          inserisci il codice generato.
        </p>
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
          disabled={loading}
          className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
        />
        Non chiedermelo più su questo
        dispositivo per 14 giorni
      </label>

      <Button
        type="submit"
        disabled={loading || !factorId}
        className="h-12 w-full rounded-2xl bg-emerald-500 text-base font-semibold hover:bg-emerald-600"
      >
        {loading ? "Verifica..." : "Verifica"}
      </Button>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        {signingOut
          ? "Disconnessione..."
          : "Torna al login"}
      </button>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type EnrollState = {
  factorId: string;
  qrCode: string;
  secret: string;
};

export default function MfaSettings() {
  const supabase = createClient();

  const [loadingFactors, setLoadingFactors] =
    useState(true);

  const [verifiedFactorId, setVerifiedFactorId] =
    useState<string | null>(null);

  const [enrollState, setEnrollState] =
    useState<EnrollState | null>(null);

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadFactors() {
    const { data, error } =
      await supabase.auth.mfa.listFactors();

    setLoadingFactors(false);

    if (error) {
      console.error(
        "Errore recupero fattori MFA:",
        error
      );

      return;
    }

    const verified = data.totp.find(
      (factor) => factor.status === "verified"
    );

    setVerifiedFactorId(verified?.id ?? null);
  }

  useEffect(() => {
    loadFactors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * ==============================
   * ATTIVAZIONE
   * ==============================
   */

  async function handleStartEnroll() {
    setBusy(true);

    const { data, error } =
      await supabase.auth.mfa.enroll({
        factorType: "totp",
      });

    setBusy(false);

    if (error) {
      console.error(
        "Errore enroll MFA:",
        error
      );

      toast.error(error.message);
      return;
    }

    setEnrollState({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    });
  }

  async function handleCancelEnroll() {
    if (!enrollState) {
      return;
    }

    setBusy(true);

    await supabase.auth.mfa.unenroll({
      factorId: enrollState.factorId,
    });

    setBusy(false);
    setEnrollState(null);
    setCode("");
  }

  async function handleConfirmEnroll(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!enrollState) {
      return;
    }

    if (code.trim().length !== 6) {
      toast.error(
        "Inserisci il codice a 6 cifre."
      );
      return;
    }

    setBusy(true);

    const {
      data: challenge,
      error: challengeError,
    } = await supabase.auth.mfa.challenge({
      factorId: enrollState.factorId,
    });

    if (challengeError) {
      setBusy(false);

      console.error(
        "Errore challenge MFA:",
        challengeError
      );

      toast.error(challengeError.message);
      return;
    }

    const { error: verifyError } =
      await supabase.auth.mfa.verify({
        factorId: enrollState.factorId,
        challengeId: challenge.id,
        code: code.trim(),
      });

    setBusy(false);

    if (verifyError) {
      console.error(
        "Errore verifica MFA:",
        verifyError
      );

      toast.error("Codice non valido. Riprova.");
      setCode("");
      return;
    }

    toast.success(
      "Autenticazione a due fattori attivata!"
    );

    setEnrollState(null);
    setCode("");
    setLoadingFactors(true);
    await loadFactors();
  }

  /*
   * ==============================
   * DISATTIVAZIONE
   * ==============================
   */

  async function handleDisable() {
    if (!verifiedFactorId) {
      return;
    }

    const confirmed = window.confirm(
      "Sei sicuro di voler disattivare l'autenticazione a due fattori?"
    );

    if (!confirmed) {
      return;
    }

    setBusy(true);

    const { error } =
      await supabase.auth.mfa.unenroll({
        factorId: verifiedFactorId,
      });

    setBusy(false);

    if (error) {
      console.error(
        "Errore disattivazione MFA:",
        error
      );

      toast.error(error.message);
      return;
    }

    toast.success(
      "Autenticazione a due fattori disattivata."
    );

    setVerifiedFactorId(null);
  }

  /*
   * ==============================
   * RENDER
   * ==============================
   */

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div>
        <h3 className="text-xl font-bold text-slate-900">
          Autenticazione a due fattori
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Aggiungi un livello di sicurezza in
          più: oltre alla password, ti verrà
          richiesto un codice generato da
          un&apos;app di autenticazione (es.
          Google Authenticator, Authy).
        </p>
      </div>

      <div className="mt-6">
        {loadingFactors ? (
          <p className="text-sm text-slate-400">
            Caricamento...
          </p>
        ) : enrollState ? (
          <form
            onSubmit={handleConfirmEnroll}
            className="space-y-6"
          >
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-slate-50 p-6 sm:flex-row sm:items-start">
              <img
                src={enrollState.qrCode}
                alt="QR code per l'autenticazione a due fattori"
                className="h-40 w-40 rounded-xl border border-slate-200 bg-white"
              />

              <div className="text-sm text-slate-600">
                <p className="font-semibold text-slate-700">
                  1. Scansiona il QR code
                </p>

                <p className="mt-1">
                  Usa un&apos;app come Google
                  Authenticator o Authy.
                </p>

                <p className="mt-4 font-semibold text-slate-700">
                  Oppure inserisci manualmente
                  questo codice:
                </p>

                <p className="mt-1 break-all rounded-lg bg-white px-3 py-2 font-mono text-xs text-slate-500">
                  {enrollState.secret}
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                2. Inserisci il codice generato
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
                disabled={busy}
                className="h-14 w-full max-w-xs rounded-2xl border border-slate-200 px-4 text-center text-lg tracking-[0.5em] outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={busy}
                className="h-11 rounded-2xl bg-emerald-500 px-6 font-semibold hover:bg-emerald-600"
              >
                Verifica e attiva
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={handleCancelEnroll}
                className="h-11 rounded-2xl px-6 font-semibold"
              >
                Annulla
              </Button>
            </div>
          </form>
        ) : verifiedFactorId ? (
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Attiva
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={handleDisable}
              className="h-11 rounded-2xl px-6 font-semibold text-red-600 hover:bg-red-50"
            >
              Disattiva
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              <ShieldOff className="h-4 w-4" />
              Non attiva
            </div>

            <Button
              type="button"
              disabled={busy}
              onClick={handleStartEnroll}
              className="h-11 rounded-2xl bg-emerald-500 px-6 font-semibold hover:bg-emerald-600"
            >
              Attiva autenticazione a due fattori
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

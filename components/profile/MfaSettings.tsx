"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const [confirmingDisable, setConfirmingDisable] =
    useState(false);

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
    // Caricamento fattori MFA al mount: sync legittima con dati remoti.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

    fetch("/api/mfa/notify-enabled", {
      method: "POST",
    }).catch((error) => {
      console.error(
        "Errore invio email conferma MFA:",
        error
      );
    });

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

    if (!confirmingDisable) {
      setConfirmingDisable(true);
      return;
    }

    setConfirmingDisable(false);
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

    fetch("/api/mfa/notify-disabled", {
      method: "POST",
    }).catch((error) => {
      console.error(
        "Errore invio email conferma disattivazione MFA:",
        error
      );
    });

    setVerifiedFactorId(null);
  }

  /*
   * ==============================
   * RENDER
   * ==============================
   */

  return (
    <Card className="p-8">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Autenticazione a due fattori
        </h3>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
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
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-muted p-6 sm:flex-row sm:items-start">
              <img
                src={enrollState.qrCode}
                alt="QR code per l'autenticazione a due fattori"
                className="h-40 w-40 rounded-xl border border-border bg-card"
              />

              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">
                  1. Scansiona il QR code
                </p>

                <p className="mt-1">
                  Usa un&apos;app come Google
                  Authenticator o Authy.
                </p>

                <p className="mt-4 font-semibold text-foreground">
                  Oppure inserisci manualmente
                  questo codice:
                </p>

                <p className="mt-1 break-all rounded-lg bg-card px-3 py-2 font-mono text-xs text-muted-foreground">
                  {enrollState.secret}
                </p>
              </div>
            </div>

            <div>
              <Label>2. Inserisci il codice generato</Label>

              <Input
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
                className="h-14 max-w-xs rounded-2xl text-center text-lg tracking-[0.5em]"
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

            <div className="flex gap-3">
              {confirmingDisable && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    setConfirmingDisable(false)
                  }
                  className="h-11 rounded-2xl px-6 font-semibold"
                >
                  Annulla
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={handleDisable}
                className="h-11 rounded-2xl px-6 font-semibold text-destructive hover:bg-destructive/10"
              >
                {confirmingDisable
                  ? "Confermi la disattivazione?"
                  : "Disattiva"}
              </Button>
            </div>
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
    </Card>
  );
}

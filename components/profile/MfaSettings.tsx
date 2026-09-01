"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

/*
 * Se listFactors() non risolve entro questo tempo (connessione appesa
 * senza errore), fermiamo lo spinner e proponiamo un retry invece di
 * restare su "Caricamento..." all'infinito.
 */
const LOAD_TIMEOUT_MS = 15000;

type EnrollState = {
  factorId: string;
  qrCode: string;
  secret: string;
};

type Dict = {
  title: string;
  description: string;
  loading: string;
  qrAlt: string;
  step1Title: string;
  step1Description: string;
  manualEntryPrefix: string;
  step2Label: string;
  verifyAndEnableButton: string;
  cancelButton: string;
  loadError: string;
  retry: string;
  activeLabel: string;
  inactiveLabel: string;
  confirmDisableQuestion: string;
  disableButton: string;
  enableButton: string;
  reauthTitle: string;
  reauthDescription: string;
  reauthCodeLabel: string;
  reauthButton: string;
  errors: {
    codeLength: string;
    invalidCode: string;
  };
  success: {
    enabled: string;
    disabled: string;
  };
};

type Props = {
  dict: Dict;
};

export default function MfaSettings({ dict }: Props) {
  const supabase = createClient();

  const [loadingFactors, setLoadingFactors] =
    useState(true);

  const [loadError, setLoadError] =
    useState(false);

  const [reloadKey, setReloadKey] =
    useState(0);

  const [verifiedFactorId, setVerifiedFactorId] =
    useState<string | null>(null);

  const [enrollState, setEnrollState] =
    useState<EnrollState | null>(null);

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const [confirmingDisable, setConfirmingDisable] =
    useState(false);

  const [needsReauth, setNeedsReauth] = useState(false);
  const [reauthCode, setReauthCode] = useState("");

  async function loadFactors() {
    try {
      const { data, error } =
        await supabase.auth.mfa.listFactors();

      if (error) {
        console.error(
          "Errore recupero fattori MFA:",
          error
        );

        setLoadError(true);
        setLoadingFactors(false);
        return;
      }

      const verified = data.totp.find(
        (factor) => factor.status === "verified"
      );

      setVerifiedFactorId(verified?.id ?? null);
      setLoadError(false);
      setLoadingFactors(false);
    } catch (error) {
      console.error(
        "Errore recupero fattori MFA:",
        error
      );

      setLoadError(true);
      setLoadingFactors(false);
    }
  }

  useEffect(() => {
    // Caricamento fattori MFA al mount / al retry: sync legittima con
    // dati remoti.
    let active = true;

    // Reset dello stato di caricamento prima di ogni (ri)fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingFactors(true);
    setLoadError(false);

    // Watchdog: se listFactors() non risolve entro il tempo massimo,
    // sblocchiamo la UI con un retry.
    const watchdog = window.setTimeout(() => {
      if (active) {
        setLoadError(true);
        setLoadingFactors(false);
      }
    }, LOAD_TIMEOUT_MS);

    void loadFactors().finally(() => {
      window.clearTimeout(watchdog);
    });

    return () => {
      active = false;
      window.clearTimeout(watchdog);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

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
      toast.error(dict.errors.codeLength);
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

      toast.error(dict.errors.invalidCode);
      setCode("");
      return;
    }

    toast.success(dict.success.enabled);

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

    /*
     * Supabase richiede una sessione AAL2 per poter disattivare un
     * fattore MFA verificato (altrimenti basterebbe la password per
     * rimuovere la 2FA, vanificandola). Se la sessione corrente è
     * ancora AAL1 (es. dopo un refresh della pagina), chiediamo prima
     * un codice dell'app di autenticazione per elevarla.
     */
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aal?.currentLevel !== "aal2") {
      setNeedsReauth(true);
      return;
    }

    await disableFactor();
  }

  async function disableFactor() {
    if (!verifiedFactorId) {
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

    toast.success(dict.success.disabled);

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

  async function handleReauthAndDisable(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!verifiedFactorId) {
      return;
    }

    if (reauthCode.trim().length !== 6) {
      toast.error(dict.errors.codeLength);
      return;
    }

    setBusy(true);

    const {
      data: challenge,
      error: challengeError,
    } = await supabase.auth.mfa.challenge({
      factorId: verifiedFactorId,
    });

    if (challengeError) {
      setBusy(false);

      console.error(
        "Errore challenge MFA (riautenticazione):",
        challengeError
      );

      toast.error(challengeError.message);
      return;
    }

    const { error: verifyError } =
      await supabase.auth.mfa.verify({
        factorId: verifiedFactorId,
        challengeId: challenge.id,
        code: reauthCode.trim(),
      });

    if (verifyError) {
      setBusy(false);

      console.error(
        "Errore verifica MFA (riautenticazione):",
        verifyError
      );

      toast.error(dict.errors.invalidCode);
      setReauthCode("");
      return;
    }

    setNeedsReauth(false);
    setReauthCode("");

    await disableFactor();
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
          {dict.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {dict.description}
        </p>
      </div>

      <div className="mt-6">
        {loadingFactors ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {dict.loading}
          </p>
        ) : loadError ? (
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              {dict.loadError}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setReloadKey((key) => key + 1)
              }
              className="h-11 px-6 font-semibold"
            >
              {dict.retry}
            </Button>
          </div>
        ) : needsReauth ? (
          <form
            onSubmit={handleReauthAndDisable}
            className="space-y-6"
          >
            <div>
              <p className="font-semibold text-foreground">
                {dict.reauthTitle}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {dict.reauthDescription}
              </p>
            </div>

            <div>
              <Label htmlFor="mfa-reauth-code">{dict.reauthCodeLabel}</Label>

              <Input
                id="mfa-reauth-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={reauthCode}
                onChange={(e) =>
                  setReauthCode(
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
                className="h-11 bg-destructive px-6 font-semibold text-destructive-foreground hover:bg-destructive/90"
              >
                {dict.reauthButton}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setNeedsReauth(false);
                  setReauthCode("");
                }}
                className="h-11 px-6 font-semibold"
              >
                {dict.cancelButton}
              </Button>
            </div>
          </form>
        ) : enrollState ? (
          <form
            onSubmit={handleConfirmEnroll}
            className="space-y-6"
          >
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-muted p-6 sm:flex-row sm:items-start">
              {/* eslint-disable-next-line @next/next/no-img-element -- data: URI (QR code from Supabase), not eligible for next/image optimization */}
              <img
                src={enrollState.qrCode}
                alt={dict.qrAlt}
                className="h-40 w-40 rounded-xl border border-border bg-card"
              />

              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">
                  {dict.step1Title}
                </p>

                <p className="mt-1">
                  {dict.step1Description}
                </p>

                <p className="mt-4 font-semibold text-foreground">
                  {dict.manualEntryPrefix}
                </p>

                <p className="mt-1 break-all rounded-lg bg-card px-3 py-2 font-mono text-xs text-muted-foreground">
                  {enrollState.secret}
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="mfa-enroll-code">{dict.step2Label}</Label>

              <Input
                id="mfa-enroll-code"
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
                className="h-11 bg-primary px-6 font-semibold hover:bg-primary/90"
              >
                {dict.verifyAndEnableButton}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={handleCancelEnroll}
                className="h-11 px-6 font-semibold"
              >
                {dict.cancelButton}
              </Button>
            </div>
          </form>
        ) : verifiedFactorId ? (
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
              {dict.activeLabel}
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
                  className="h-11 px-6 font-semibold"
                >
                  {dict.cancelButton}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={handleDisable}
                className="h-11 px-6 font-semibold text-destructive hover:bg-destructive/10"
              >
                {confirmingDisable
                  ? dict.confirmDisableQuestion
                  : dict.disableButton}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground">
              <ShieldOff className="h-4 w-4" />
              {dict.inactiveLabel}
            </div>

            <Button
              type="button"
              disabled={busy}
              onClick={handleStartEnroll}
              className="h-11 bg-primary px-6 font-semibold hover:bg-primary/90"
            >
              {dict.enableButton}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

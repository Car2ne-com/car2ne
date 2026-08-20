"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <Card className="p-8">
      <form
        onSubmit={handleVerify}
        className="space-y-6"
      >
        <div>
          <Label>Codice di verifica</Label>

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
            disabled={loading}
            className="h-14 rounded-2xl text-center text-lg tracking-[0.5em]"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            Apri la tua app di autenticazione e
            inserisci il codice generato.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
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

        <Button
          type="button"
          variant="ghost"
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          {signingOut
            ? "Disconnessione..."
            : "Torna al login"}
        </Button>
      </form>
    </Card>
  );
}

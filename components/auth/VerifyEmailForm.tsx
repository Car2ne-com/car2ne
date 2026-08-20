"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { it } from "@/lib/i18n/dictionaries/it";

type AuthDict = (typeof it)["auth"];

type Props = {
  email: string;
  next: string | null;
  dict: AuthDict;
};

type ErrorReason =
  | "invalid"
  | "not_found"
  | "expired"
  | "too_many_attempts"
  | "generic";

export default function VerifyEmailForm({
  email,
  next,
  dict,
}: Props) {
  const router = useRouter();
  const t = dict.verifyEmail;

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [signingOut, setSigningOut] = useState(false);

  const hasAutoSent = useRef(false);

  useEffect(() => {
    if (hasAutoSent.current) {
      return;
    }

    hasAutoSent.current = true;
    sendCode({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  async function sendCode({ silent }: { silent: boolean }) {
    if (!silent) {
      setResending(true);
    }

    try {
      const response = await fetch(
        "/api/auth/send-verification-email",
        { method: "POST" }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 429) {
        setCooldown(data.retryAfterSeconds ?? 0);

        if (!silent) {
          toast.error(t.errors.cooldown);
        }

        return;
      }

      if (!response.ok) {
        // Un fallimento di invio è sempre informativo per l'utente,
        // anche al primo tentativo automatico al caricamento della
        // pagina: restare in silenzio lo lascerebbe bloccato su
        // "controlla la tua email" senza sapere che non è mai partita.
        toast.error(t.errors.generic);
        return;
      }

      setCooldown(45);

      if (!silent) {
        toast.success(t.emailSent);
      }
    } catch (error) {
      console.error("Errore invio codice verifica:", error);
      toast.error(t.errors.generic);
    } finally {
      if (!silent) {
        setResending(false);
      }
    }
  }

  async function handleVerify(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (code.trim().length !== 6) {
      toast.error(t.errors.codeLength);
      return;
    }

    setVerifying(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const reason = (data.error ?? "generic") as ErrorReason;

        toast.error(
          t.errors[reason] ?? t.errors.generic
        );

        setCode("");
        return;
      }

      toast.success(t.success);

      const redirectTo =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/dashboard";

      router.push(redirectTo);
      router.refresh();
    } finally {
      setVerifying(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <Card className="p-8">
      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {t.pageSubtitle.replace("{email}", email)}
          </p>
        </div>

        <div>
          <Label>{t.codeLabel}</Label>

          <Input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, ""))
            }
            maxLength={6}
            disabled={verifying}
            className="h-14 rounded-2xl text-center text-lg tracking-[0.5em]"
          />
        </div>

        <Button
          type="submit"
          disabled={verifying}
          className="h-12 w-full rounded-2xl bg-primary text-base font-semibold hover:bg-primary/90"
        >
          {verifying ? t.verifying : t.verifyButton}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => sendCode({ silent: false })}
          disabled={resending || cooldown > 0}
          className="w-full font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          {resending
            ? t.resending
            : cooldown > 0
              ? t.resendCooldown.replace(
                  "{seconds}",
                  String(cooldown)
                )
              : t.resendButton}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          {signingOut ? dict.mfaChallenge.signingOut : t.signOut}
        </Button>
      </form>
    </Card>
  );
}

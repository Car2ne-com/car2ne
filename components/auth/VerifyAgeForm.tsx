"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  calculateAge,
  MINIMUM_AGE,
} from "@/lib/utils/age";
import type { it } from "@/lib/i18n/dictionaries/it";

type AuthDict = (typeof it)["auth"];

type Props = {
  next: string | null;
  dict: AuthDict;
};

export default function VerifyAgeForm({
  next,
  dict,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [birthDate, setBirthDate] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const age = useMemo(
    () => calculateAge(birthDate),
    [birthDate]
  );

  const isAdult =
    age !== null && age >= MINIMUM_AGE;

  /*
   * ==============================
   * SUBMIT
   * ==============================
   */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!birthDate) {
      toast.error(dict.verifyAge.emptyBirthDateError);
      return;
    }

    setLoading(true);

    /*
     * ==============================
     * ETÀ INSUFFICIENTE
     * ==============================
     *
     * L'account è già stato creato da Google
     * OAuth: se l'utente non è maggiorenne lo
     * eliminiamo e chiudiamo la sessione,
     * invece di lasciarlo bloccato su questa
     * pagina.
     */

    if (!isAdult) {
      const response = await fetch(
        "/api/auth/reject-underage",
        { method: "POST" }
      );

      if (!response.ok) {
        console.error(
          "Errore eliminazione account minorenne."
        );
      }

      await supabase.auth.signOut();

      setLoading(false);

      toast.error(dict.verifyAge.notAdultToast);

      router.push("/");
      return;
    }

    /*
     * ==============================
     * SALVATAGGIO DATA DI NASCITA
     * ==============================
     */

    const { error } =
      await supabase.auth.updateUser({
        data: { birth_date: birthDate },
      });

    if (error) {
      setLoading(false);

      console.error(
        "Errore salvataggio data di nascita:",
        error
      );

      toast.error(error.message);
      return;
    }

    const redirectTo =
      next &&
      next.startsWith("/") &&
      !next.startsWith("//")
        ? next
        : "/dashboard";

    /*
     * ==============================
     * VERIFICA MFA (AAL2)
     * ==============================
     *
     * Se l'account ha già la 2FA attiva, non
     * saltiamo la richiesta del codice.
     */

    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    setLoading(false);

    if (
      aal &&
      aal.nextLevel === "aal2" &&
      aal.nextLevel !== aal.currentLevel
    ) {
      const challengeUrl = new URL(
        "/mfa-challenge",
        window.location.origin
      );

      challengeUrl.searchParams.set(
        "next",
        redirectTo
      );

      router.push(
        `${challengeUrl.pathname}${challengeUrl.search}`
      );
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Card className="p-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <Label>{dict.registerForm.birthDateLabel}</Label>

          <Input
            type="date"
            value={birthDate}
            onChange={(e) =>
              setBirthDate(e.target.value)
            }
            max={
              new Date()
                .toISOString()
                .split("T")[0]
            }
            disabled={loading}
            className="h-14 rounded-2xl"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            {dict.registerForm.ageNotice}
          </p>

          {birthDate.length > 0 &&
            age !== null &&
            !isAdult && (
              <FieldError>
                {dict.verifyAge.notAdultFieldError}
              </FieldError>
            )}
        </div>

        <Button
          type="submit"
          disabled={loading || !birthDate}
          className="h-12 w-full rounded-2xl bg-primary text-base font-semibold hover:bg-primary/90"
        >
          {loading
            ? dict.verifyAge.verifying
            : dict.verifyAge.continueButton}
        </Button>
      </form>
    </Card>
  );
}

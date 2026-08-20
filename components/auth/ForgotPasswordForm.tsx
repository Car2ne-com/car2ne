"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { it } from "@/lib/i18n/dictionaries/it";

type AuthDict = (typeof it)["auth"];

type Props = {
  dict: AuthDict;
};

export default function ForgotPasswordForm({ dict }: Props) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(dict.forgotPasswordForm.errors.emptyEmail);
      return;
    }

    setLoading(true);

    const redirectTo = new URL(
      "/auth/callback",
      window.location.origin
    );

    redirectTo.searchParams.set(
      "next",
      "/reset-password"
    );

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: redirectTo.toString(),
        }
      );

    setLoading(false);

    if (error) {
      console.error(
        "Errore reset password:",
        error
      );

      toast.error(error.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <Card className="space-y-6 p-8 text-center">
        <h2 className="text-xl font-bold text-foreground">
          {dict.forgotPasswordForm.sentTitle}
        </h2>

        <p className="text-sm text-muted-foreground">
          {dict.forgotPasswordForm.sentDescriptionPrefix}{" "}
          <strong>{email.trim()}</strong>
          {dict.forgotPasswordForm.sentDescriptionSuffix}
        </p>

        <Link
          href="/login"
          className="inline-block text-sm font-semibold text-primary hover:text-primary/80"
        >
          {dict.common.backToLogin}
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <Label>{dict.common.emailLabel}</Label>

          <Input
            type="email"
            placeholder={dict.common.emailPlaceholder}
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            disabled={loading}
            autoComplete="email"
            className="h-14 rounded-2xl"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-2xl bg-primary text-base font-semibold hover:bg-primary/90"
        >
          {loading
            ? dict.forgotPasswordForm.sending
            : dict.forgotPasswordForm.sendButton}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-primary/80"
          >
            {dict.common.backToLogin}
          </Link>
        </p>
      </form>
    </Card>
  );
}

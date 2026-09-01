"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { it } from "@/lib/i18n/dictionaries/it";

type AuthDict = (typeof it)["auth"];

type Props = {
  dict: AuthDict;
};

export default function ForgotPasswordForm({ dict }: Props) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error(dict.forgotPasswordForm.errors.emptyEmail);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail }),
        }
      );

      if (!response.ok && response.status !== 429) {
        toast.error(dict.resetPasswordForm.errors.generic);
        return;
      }

      toast.success(dict.forgotPasswordForm.codeSentToast);

      router.push(
        `/reset-password?email=${encodeURIComponent(trimmedEmail)}`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <Label htmlFor="forgot-password-email">{dict.common.emailLabel}</Label>

          <Input
            id="forgot-password-email"
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
          className="h-12 w-full text-base font-semibold"
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

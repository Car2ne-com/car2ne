"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import type { it } from "@/lib/i18n/dictionaries/it";

type AuthDict = (typeof it)["auth"];

type Props = {
  email: string;
  dict: AuthDict;
};

type ErrorReason =
  | "invalid"
  | "not_found"
  | "expired"
  | "too_many_attempts"
  | "weak_password"
  | "generic";

export default function ResetPasswordForm({ email, dict }: Props) {
  const router = useRouter();
  const t = dict.resetPasswordForm;

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const passwordRules = useMemo(
    () => ({
      minLength: password.length >= 8,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password]
  );

  const passwordIsValid =
    passwordRules.minLength &&
    passwordRules.number &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.special;

  async function handleResend() {
    setResending(true);

    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 429) {
        setCooldown(data.retryAfterSeconds ?? 0);
        toast.error(t.errors.cooldown);
        return;
      }

      if (!response.ok) {
        toast.error(t.errors.generic);
        return;
      }

      setCooldown(45);
      toast.success(dict.forgotPasswordForm.codeSentToast);
    } finally {
      setResending(false);
    }
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (code.trim().length !== 6) {
      toast.error(t.errors.codeLength);
      return;
    }

    if (!passwordIsValid) {
      toast.error(t.errors.weakPassword);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t.errors.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            code: code.trim(),
            password,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const reason = (data.error ?? "generic") as ErrorReason;

        let message = t.errors.generic;

        if (reason === "weak_password") {
          message = t.errors.weakPassword;
        } else if (reason in t.errors) {
          message =
            t.errors[
              reason as keyof typeof t.errors
            ];
        }

        toast.error(message);

        setCode("");
        return;
      }

      toast.success(t.success);
      router.push("/login");
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
            disabled={loading}
            className="h-14 rounded-2xl text-center text-lg tracking-[0.5em]"
          />
        </div>

        <div>
          <Label>{t.newPasswordLabel}</Label>

          <div className="relative">
            <Input
              type={
                showPassword ? "text" : "password"
              }
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              disabled={loading}
              autoComplete="new-password"
              className="h-14 rounded-2xl pr-12"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                setShowPassword(
                  (current) => !current
                )
              }
              disabled={loading}
              aria-label={
                showPassword
                  ? dict.common.hidePassword
                  : dict.common.showPassword
              }
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-primary"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="mt-4 rounded-2xl bg-muted p-4">
            <p className="mb-3 text-xs font-semibold text-muted-foreground">
              {dict.common.passwordRequirementsTitle}
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              <PasswordRule
                valid={passwordRules.minLength}
                text={dict.common.ruleMinLength}
              />

              <PasswordRule
                valid={passwordRules.number}
                text={dict.common.ruleNumber}
              />

              <PasswordRule
                valid={passwordRules.uppercase}
                text={dict.common.ruleUppercase}
              />

              <PasswordRule
                valid={passwordRules.lowercase}
                text={dict.common.ruleLowercase}
              />

              <PasswordRule
                valid={passwordRules.special}
                text={dict.common.ruleSpecial}
              />
            </div>
          </div>
        </div>

        <div>
          <Label>{t.confirmNewPasswordLabel}</Label>

          <Input
            type={
              showPassword ? "text" : "password"
            }
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            disabled={loading}
            autoComplete="new-password"
            className="h-14 rounded-2xl"
          />

          {confirmPassword.length > 0 &&
            password !== confirmPassword && (
              <FieldError>{dict.common.passwordsDontMatch}</FieldError>
            )}
        </div>

        <Button
          type="submit"
          disabled={
            loading ||
            !passwordIsValid ||
            password !== confirmPassword
          }
          className="h-12 w-full rounded-2xl bg-primary text-base font-semibold hover:bg-primary/90"
        >
          {loading ? t.updating : t.updateButton}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={handleResend}
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

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/forgot-password"
            className="font-semibold text-primary hover:text-primary/80"
          >
            {t.wrongEmailLink}
          </Link>
        </p>
      </form>
    </Card>
  );
}

function PasswordRule({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-xs font-medium ${
        valid
          ? "text-primary"
          : "text-muted-foreground"
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
          valid
            ? "bg-accent"
            : "bg-muted"
        }`}
      >
        {valid ? "✓" : "•"}
      </span>

      {text}
    </div>
  );
}

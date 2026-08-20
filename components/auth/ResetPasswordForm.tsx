"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { it } from "@/lib/i18n/dictionaries/it";

type AuthDict = (typeof it)["auth"];

type Props = {
  dict: AuthDict;
};

export default function ResetPasswordForm({ dict }: Props) {
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

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

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!passwordIsValid) {
      toast.error(dict.resetPasswordForm.errors.weakPassword);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(dict.resetPasswordForm.errors.passwordMismatch);
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    setLoading(false);

    if (error) {
      console.error(
        "Errore aggiornamento password:",
        error
      );

      toast.error(error.message);
      return;
    }

    toast.success(dict.resetPasswordForm.success);

    router.push("/login");
  }

  return (
    <Card className="p-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <Label>{dict.resetPasswordForm.newPasswordLabel}</Label>

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
          <Label>{dict.resetPasswordForm.confirmNewPasswordLabel}</Label>

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
          className="h-12 w-full rounded-2xl bg-emerald-500 text-base font-semibold hover:bg-emerald-600"
        >
          {loading
            ? dict.resetPasswordForm.updating
            : dict.resetPasswordForm.updateButton}
        </Button>
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
          ? "text-emerald-600"
          : "text-slate-400"
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
          valid
            ? "bg-emerald-100"
            : "bg-slate-200"
        }`}
      >
        {valid ? "✓" : "•"}
      </span>

      {text}
    </div>
  );
}

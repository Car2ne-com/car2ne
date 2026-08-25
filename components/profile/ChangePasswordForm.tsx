"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Dict = {
  title: string;
  description: string;
  changeButton: string;
  newPasswordLabel: string;
  showPassword: string;
  hidePassword: string;
  passwordRequirementsTitle: string;
  ruleMinLength: string;
  ruleNumber: string;
  ruleUppercase: string;
  ruleLowercase: string;
  ruleSpecial: string;
  confirmNewPasswordLabel: string;
  passwordsDontMatch: string;
  updateButton: string;
  updating: string;
  cancelButton: string;
  errors: {
    weakPassword: string;
    passwordMismatch: string;
  };
  success: string;
};

type Props = {
  dict: Dict;
};

export default function ChangePasswordForm({ dict }: Props) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [open, setOpen] = useState(false);

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

  function resetForm() {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setOpen(false);
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!passwordIsValid) {
      toast.error(dict.errors.weakPassword);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(dict.errors.passwordMismatch);
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

    toast.success(dict.success);

    resetForm();
  }

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
        {!open ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(true)}
            className="h-11 rounded-2xl px-6 font-semibold"
          >
            <KeyRound className="mr-2 h-4 w-4" />
            {dict.changeButton}
          </Button>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="change-password-new">{dict.newPasswordLabel}</Label>

              <div className="relative">
                <Input
                  id="change-password-new"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
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
                      ? dict.hidePassword
                      : dict.showPassword
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
                  {dict.passwordRequirementsTitle}
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
                  <PasswordRule
                    valid={
                      passwordRules.minLength
                    }
                    text={dict.ruleMinLength}
                  />

                  <PasswordRule
                    valid={
                      passwordRules.number
                    }
                    text={dict.ruleNumber}
                  />

                  <PasswordRule
                    valid={
                      passwordRules.uppercase
                    }
                    text={dict.ruleUppercase}
                  />

                  <PasswordRule
                    valid={
                      passwordRules.lowercase
                    }
                    text={dict.ruleLowercase}
                  />

                  <PasswordRule
                    valid={
                      passwordRules.special
                    }
                    text={dict.ruleSpecial}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="change-password-confirm">{dict.confirmNewPasswordLabel}</Label>

              <Input
                id="change-password-confirm"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                disabled={loading}
                autoComplete="new-password"
                className="h-14 rounded-2xl"
              />

              {confirmPassword.length > 0 &&
                password !==
                  confirmPassword && (
                  <FieldError>
                    {dict.passwordsDontMatch}
                  </FieldError>
                )}
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={
                  loading ||
                  !passwordIsValid ||
                  password !== confirmPassword
                }
                className="h-11 rounded-2xl bg-primary px-6 font-semibold hover:bg-primary/90"
              >
                {loading
                  ? dict.updating
                  : dict.updateButton}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={resetForm}
                className="h-11 rounded-2xl px-6 font-semibold"
              >
                {dict.cancelButton}
              </Button>
            </div>
          </form>
        )}
      </div>
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

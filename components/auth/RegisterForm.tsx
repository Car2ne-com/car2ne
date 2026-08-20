"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
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
  dict: AuthDict;
};

export default function RegisterForm({ dict }: Props) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [birthDate, setBirthDate] =
    useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [oauthLoading, setOauthLoading] =
    useState<"google" | null>(null);

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  /*
   * ==============================
   * REGOLE PASSWORD
   * ==============================
   */

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

  /*
   * ==============================
   * VERIFICA ETÀ (SERVIZIO 18+)
   * ==============================
   */

  const age = useMemo(
    () => calculateAge(birthDate),
    [birthDate]
  );

  const isAdult =
    age !== null && age >= MINIMUM_AGE;

  /*
   * ==============================
   * REGISTRAZIONE
   * ==============================
   */

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(dict.registerForm.errors.emptyName);
      return;
    }

    if (!surname.trim()) {
      toast.error(dict.registerForm.errors.emptySurname);
      return;
    }

    if (!birthDate) {
      toast.error(dict.registerForm.errors.emptyBirthDate);
      return;
    }

    if (!isAdult) {
      toast.error(dict.registerForm.errors.notAdult);
      return;
    }

    if (!email.trim()) {
      toast.error(dict.registerForm.errors.emptyEmail);
      return;
    }

    if (!passwordIsValid) {
      toast.error(dict.registerForm.errors.weakPassword);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(dict.registerForm.errors.passwordMismatch);
      return;
    }

    if (!acceptedTerms) {
      toast.error(dict.registerForm.errors.termsNotAccepted);
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            surname: surname.trim(),
            birth_date: birthDate,
          },
        },
      });

    setLoading(false);

    if (error) {
      console.error(
        "Errore registrazione:",
        error
      );

      toast.error(error.message);
      return;
    }

    toast.success(dict.registerForm.success);
  }

  /*
   * ==============================
   * GOOGLE / APPLE
   * ==============================
   */

  async function handleOAuth(
    provider: "google"
  ) {
    if (oauthLoading) {
      return;
    }

    if (!acceptedTerms) {
      toast.error(dict.registerForm.errors.termsNotAccepted);
      return;
    }

    setOauthLoading(provider);

    const redirectTo =
      `${window.location.origin}/auth/callback`;

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

    if (error) {
      console.error(
        `Errore login ${provider}:`,
        error
      );

      setOauthLoading(null);
      toast.error(error.message);
    }
  }

  /*
   * ==============================
   * RENDER
   * ==============================
   */

  return (
    <Card className="p-8">
      <form
        onSubmit={handleRegister}
        className="space-y-6"
      >
        {/* Nome */}

        <div>
          <Label>{dict.registerForm.nameLabel}</Label>

          <Input
            type="text"
            placeholder={dict.registerForm.namePlaceholder}
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            disabled={
              loading || !!oauthLoading
            }
            className="h-14 rounded-2xl"
          />
        </div>

        {/* Cognome */}

        <div>
          <Label>{dict.registerForm.surnameLabel}</Label>

          <Input
            type="text"
            placeholder={dict.registerForm.surnamePlaceholder}
            value={surname}
            onChange={(e) =>
              setSurname(e.target.value)
            }
            disabled={
              loading || !!oauthLoading
            }
            className="h-14 rounded-2xl"
          />
        </div>

        {/* Data di nascita */}

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
            disabled={
              loading || !!oauthLoading
            }
            className="h-14 rounded-2xl"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            {dict.registerForm.ageNotice}
          </p>

          {birthDate.length > 0 &&
            age !== null &&
            !isAdult && (
              <FieldError>{dict.registerForm.ageError}</FieldError>
            )}
        </div>

        {/* Email */}

        <div>
          <Label>{dict.common.emailLabel}</Label>

          <Input
            type="email"
            placeholder={dict.common.emailPlaceholder}
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            disabled={
              loading || !!oauthLoading
            }
            className="h-14 rounded-2xl"
          />
        </div>

        {/* Password */}

        <div>
          <Label>{dict.common.passwordLabel}</Label>

          <div className="relative">
            <Input
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
              disabled={
                loading || !!oauthLoading
              }
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
              disabled={
                loading || !!oauthLoading
              }
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

          {/* Regole password */}

          <div className="mt-4 rounded-2xl bg-muted p-4">
            <p className="mb-3 text-xs font-semibold text-muted-foreground">
              {dict.common.passwordRequirementsTitle}
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              <PasswordRule
                valid={
                  passwordRules.minLength
                }
                text={dict.common.ruleMinLength}
              />

              <PasswordRule
                valid={
                  passwordRules.number
                }
                text={dict.common.ruleNumber}
              />

              <PasswordRule
                valid={
                  passwordRules.uppercase
                }
                text={dict.common.ruleUppercase}
              />

              <PasswordRule
                valid={
                  passwordRules.lowercase
                }
                text={dict.common.ruleLowercase}
              />

              <PasswordRule
                valid={
                  passwordRules.special
                }
                text={dict.common.ruleSpecial}
              />
            </div>
          </div>
        </div>

        {/* Conferma Password */}

        <div>
          <Label>{dict.registerForm.confirmPasswordLabel}</Label>

          <div className="relative">
            <Input
              type={
                showConfirmPassword
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
              disabled={
                loading || !!oauthLoading
              }
              className="h-14 rounded-2xl pr-12"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                setShowConfirmPassword(
                  (current) => !current
                )
              }
              disabled={
                loading || !!oauthLoading
              }
              aria-label={
                showConfirmPassword
                  ? dict.registerForm.hideConfirmPassword
                  : dict.registerForm.showConfirmPassword
              }
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-primary"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </Button>
          </div>

          {confirmPassword.length > 0 &&
            password !==
              confirmPassword && (
              <FieldError>{dict.common.passwordsDontMatch}</FieldError>
            )}

          {confirmPassword.length > 0 &&
            password ===
              confirmPassword && (
              <p className="mt-1.5 text-xs font-medium text-emerald-600">
                {dict.common.passwordsMatch}
              </p>
            )}
        </div>

        {/* Accettazione Termini + Privacy */}

        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) =>
              setAcceptedTerms(
                e.target.checked
              )
            }
            disabled={
              loading || !!oauthLoading
            }
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
          />

          <span>
            {dict.registerForm.acceptTermsPrefix}{" "}
            <Link
              href="/termini"
              target="_blank"
              className="font-semibold text-primary hover:text-emerald-700"
            >
              {dict.registerForm.termsAndConditions}
            </Link>{" "}
            {dict.registerForm.acceptPrivacyMiddle}{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="font-semibold text-primary hover:text-emerald-700"
            >
              {dict.registerForm.privacyPolicy}
            </Link>
            .
          </span>
        </label>

        {/* Registrazione */}

        <Button
          type="submit"
          disabled={
            loading ||
            !!oauthLoading ||
            !passwordIsValid ||
            password !==
              confirmPassword ||
            !acceptedTerms ||
            !isAdult
          }
          className="h-12 w-full rounded-2xl bg-emerald-500 text-base font-semibold hover:bg-emerald-600"
        >
          {loading
            ? dict.registerForm.creatingAccount
            : dict.registerForm.createAccountButton}
        </Button>

        {/* Separatore */}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>

          <div className="relative flex justify-center">
            <span className="bg-card px-4 text-sm text-muted-foreground">
              {dict.common.or}
            </span>
          </div>
        </div>

        {/* Google */}

        <Button
          type="button"
          variant="outline"
          disabled={
            loading ||
            !!oauthLoading ||
            !acceptedTerms
          }
          onClick={() =>
            handleOAuth("google")
          }
          className="h-12 w-full rounded-2xl"
        >
          {oauthLoading ===
          "google"
            ? dict.common.connecting
            : dict.common.continueWithGoogle}
        </Button>

        {/* Login */}

        <p className="text-center text-sm text-muted-foreground">
          {dict.registerForm.haveAccount}{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-emerald-700"
          >
            {dict.registerForm.loginLink}
          </Link>
        </p>
      </form>
    </Card>
  );
}

/*
 * ==============================
 * PASSWORD RULE
 * ==============================
 */

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

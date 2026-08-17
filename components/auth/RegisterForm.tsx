"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  calculateAge,
  MINIMUM_AGE,
} from "@/lib/utils/age";

export default function RegisterForm() {
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
      toast.error("Inserisci il nome.");
      return;
    }

    if (!surname.trim()) {
      toast.error("Inserisci il cognome.");
      return;
    }

    if (!birthDate) {
      toast.error(
        "Inserisci la tua data di nascita."
      );
      return;
    }

    if (!isAdult) {
      toast.error(
        "Devi avere almeno 18 anni per registrarti a Car2ne."
      );
      return;
    }

    if (!email.trim()) {
      toast.error("Inserisci la tua email.");
      return;
    }

    if (!passwordIsValid) {
      toast.error(
        "La password non rispetta tutti i requisiti di sicurezza."
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Le password non coincidono.");
      return;
    }

    if (!acceptedTerms) {
      toast.error(
        "Devi accettare i Termini e Condizioni e la Privacy Policy per registrarti."
      );
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

    toast.success(
      "Registrazione completata! Controlla la tua email per confermare l'account."
    );
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
      toast.error(
        "Devi accettare i Termini e Condizioni e la Privacy Policy per registrarti."
      );
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
    <form
      onSubmit={handleRegister}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      {/* Nome */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Nome
        </label>

        <input
          type="text"
          placeholder="Mario"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          disabled={
            loading || !!oauthLoading
          }
          className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
      </div>

      {/* Cognome */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Cognome
        </label>

        <input
          type="text"
          placeholder="Rossi"
          value={surname}
          onChange={(e) =>
            setSurname(e.target.value)
          }
          disabled={
            loading || !!oauthLoading
          }
          className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
      </div>

      {/* Data di nascita */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Data di nascita
        </label>

        <input
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
          className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
        />

        <p className="mt-2 text-xs text-slate-500">
          Car2ne è riservato a chi ha almeno
          18 anni.
        </p>

        {birthDate.length > 0 &&
          age !== null &&
          !isAdult && (
            <p className="mt-2 text-xs font-medium text-red-500">
              Devi avere almeno 18 anni per
              registrarti.
            </p>
          )}
      </div>

      {/* Email */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Email
        </label>

        <input
          type="email"
          placeholder="nome@email.com"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          disabled={
            loading || !!oauthLoading
          }
          className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
      </div>

      {/* Password */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Password
        </label>

        <div className="relative">
          <input
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
            className="h-14 w-full rounded-2xl border border-slate-200 px-4 pr-12 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <button
            type="button"
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
                ? "Nascondi password"
                : "Mostra password"
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-emerald-600"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Regole password */}

        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="mb-3 text-xs font-semibold text-slate-600">
            La password deve contenere:
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <PasswordRule
              valid={
                passwordRules.minLength
              }
              text="Almeno 8 caratteri"
            />

            <PasswordRule
              valid={
                passwordRules.number
              }
              text="Almeno un numero"
            />

            <PasswordRule
              valid={
                passwordRules.uppercase
              }
              text="Una lettera maiuscola"
            />

            <PasswordRule
              valid={
                passwordRules.lowercase
              }
              text="Una lettera minuscola"
            />

            <PasswordRule
              valid={
                passwordRules.special
              }
              text="Un carattere speciale"
            />
          </div>
        </div>
      </div>

      {/* Conferma Password */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Conferma password
        </label>

        <div className="relative">
          <input
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
            className="h-14 w-full rounded-2xl border border-slate-200 px-4 pr-12 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <button
            type="button"
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
                ? "Nascondi conferma password"
                : "Mostra conferma password"
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-emerald-600"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {confirmPassword.length > 0 &&
          password !==
            confirmPassword && (
            <p className="mt-2 text-xs font-medium text-red-500">
              Le password non coincidono.
            </p>
          )}

        {confirmPassword.length > 0 &&
          password ===
            confirmPassword && (
            <p className="mt-2 text-xs font-medium text-emerald-600">
              ✓ Le password coincidono.
            </p>
          )}
      </div>

      {/* Accettazione Termini + Privacy */}

      <label className="flex items-start gap-3 text-sm text-slate-600">
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
          Accetto i{" "}
          <Link
            href="/termini"
            target="_blank"
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Termini e Condizioni
          </Link>{" "}
          e ho letto la{" "}
          <Link
            href="/privacy"
            target="_blank"
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Privacy Policy
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
          ? "Creazione account..."
          : "Crea account"}
      </Button>

      {/* Separatore */}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>

        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm text-slate-500">
            oppure
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
          ? "Connessione..."
          : "Continua con Google"}
      </Button>

      {/* Login */}

      <p className="text-center text-sm text-slate-600">
        Hai già un account?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Accedi
        </Link>
      </p>
    </form>
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
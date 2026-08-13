"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
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
      toast.error(
        "La password non rispetta tutti i requisiti di sicurezza."
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Le password non coincidono.");
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

    toast.success(
      "Password aggiornata con successo!"
    );

    router.push("/login");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Nuova password
        </label>

        <div className="relative">
          <input
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
            className="h-14 w-full rounded-2xl border border-slate-200 px-4 pr-12 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) => !current
              )
            }
            disabled={loading}
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

        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="mb-3 text-xs font-semibold text-slate-600">
            La password deve contenere:
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <PasswordRule
              valid={passwordRules.minLength}
              text="Almeno 8 caratteri"
            />

            <PasswordRule
              valid={passwordRules.number}
              text="Almeno un numero"
            />

            <PasswordRule
              valid={passwordRules.uppercase}
              text="Una lettera maiuscola"
            />

            <PasswordRule
              valid={passwordRules.lowercase}
              text="Una lettera minuscola"
            />

            <PasswordRule
              valid={passwordRules.special}
              text="Un carattere speciale"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Conferma nuova password
        </label>

        <input
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
          className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
        />

        {confirmPassword.length > 0 &&
          password !== confirmPassword && (
            <p className="mt-2 text-xs font-medium text-red-500">
              Le password non coincidono.
            </p>
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
          ? "Aggiornamento..."
          : "Aggiorna password"}
      </Button>
    </form>
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

"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordForm() {
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

    resetForm();
  }

  return (
    <Card className="p-8">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Password
        </h3>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Aggiorna la password del tuo account.
          Se hai effettuato l&apos;accesso con
          Google, questo ti permetterà di
          impostarne una anche per l&apos;email.
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
            Cambia password
          </Button>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <Label>Nuova password</Label>

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
                      ? "Nascondi password"
                      : "Mostra password"
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

            <div>
              <Label>Conferma nuova password</Label>

              <Input
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
                    Le password non coincidono.
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
                className="h-11 rounded-2xl bg-emerald-500 px-6 font-semibold hover:bg-emerald-600"
              >
                {loading
                  ? "Aggiornamento..."
                  : "Aggiorna password"}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={resetForm}
                className="h-11 rounded-2xl px-6 font-semibold"
              >
                Annulla
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

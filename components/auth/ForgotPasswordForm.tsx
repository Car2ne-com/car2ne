"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
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
      toast.error("Inserisci la tua email.");
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
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Controlla la tua email
        </h2>

        <p className="text-sm text-slate-600">
          Se esiste un account associato a{" "}
          <strong>{email.trim()}</strong>, ti
          abbiamo inviato un link per reimpostare
          la password.
        </p>

        <Link
          href="/login"
          className="inline-block text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Torna al login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
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
          disabled={loading}
          autoComplete="email"
          className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-2xl bg-emerald-500 text-base font-semibold hover:bg-emerald-600"
      >
        {loading
          ? "Invio..."
          : "Invia link di reset"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        <Link
          href="/login"
          className="font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Torna al login
        </Link>
      </p>
    </form>
  );
}

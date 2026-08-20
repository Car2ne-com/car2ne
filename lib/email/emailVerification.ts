import "server-only";

import { createHash, randomInt } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  getUserDisplayName,
  renderEmailHtml,
  sendTransactionalEmail,
} from "@/lib/email/brevo";

/*
 * Verifica email via OTP inviato con Brevo (non il flusso "Confirm
 * email" nativo di Supabase). I codici sono salvati come hash SHA-256
 * in una tabella protetta da RLS senza policy: solo il client admin
 * (service role) usato qui può leggerli/scriverli.
 */

const CODE_LENGTH = 6;
const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 45 * 1000;
const MAX_ATTEMPTS = 5;

function generateCode() {
  return String(randomInt(0, 1_000_000)).padStart(CODE_LENGTH, "0");
}

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function getResendCooldownSeconds(userId: string) {
  const admin = createAdminClient();

  const { data } = await admin
    .from("email_verification_codes")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return 0;
  }

  const elapsedMs = Date.now() - new Date(data.created_at).getTime();

  return Math.max(0, Math.ceil((RESEND_COOLDOWN_MS - elapsedMs) / 1000));
}

export async function sendVerificationCode({
  userId,
  email,
  user,
  locale,
  copy,
}: {
  userId: string;
  email: string;
  user: { user_metadata?: Record<string, unknown> };
  locale: "it" | "en";
  copy: { subject: string; heading: string; body: string };
}) {
  const admin = createAdminClient();
  const code = generateCode();

  // Un solo codice valido alla volta per utente.
  await admin
    .from("email_verification_codes")
    .delete()
    .eq("user_id", userId);

  const { error } = await admin
    .from("email_verification_codes")
    .insert({
      user_id: userId,
      code_hash: hashCode(code),
      expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
    });

  if (error) {
    throw new Error(error.message);
  }

  const name = getUserDisplayName(user, locale);

  const sent = await sendTransactionalEmail({
    to: { email },
    subject: copy.subject,
    htmlContent: renderEmailHtml({
      heading: copy.heading,
      body: copy.body.replace("{name}", name),
      code,
    }),
  });

  if (!sent) {
    // Il codice è già salvato: se l'invio fallisce lo segnaliamo con un
    // errore reale (la route API lo trasforma in 500) invece di lasciar
    // credere all'utente che l'email sia partita quando non è così.
    throw new Error("Invio email di verifica fallito.");
  }
}

type VerifyResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not_found" | "expired" | "too_many_attempts" | "invalid";
    };

export async function verifyEmailCode(
  userId: string,
  submittedCode: string
): Promise<VerifyResult> {
  const admin = createAdminClient();

  const { data: row } = await admin
    .from("email_verification_codes")
    .select("id, code_hash, expires_at, attempts")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row) {
    return { ok: false, reason: "not_found" };
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await admin
      .from("email_verification_codes")
      .delete()
      .eq("id", row.id);

    return { ok: false, reason: "expired" };
  }

  if (row.attempts >= MAX_ATTEMPTS) {
    await admin
      .from("email_verification_codes")
      .delete()
      .eq("id", row.id);

    return { ok: false, reason: "too_many_attempts" };
  }

  if (hashCode(submittedCode) !== row.code_hash) {
    await admin
      .from("email_verification_codes")
      .update({ attempts: row.attempts + 1 })
      .eq("id", row.id);

    return { ok: false, reason: "invalid" };
  }

  await admin
    .from("email_verification_codes")
    .delete()
    .eq("id", row.id);

  await admin
    .from("profiles")
    .update({ email_verified_at: new Date().toISOString() })
    .eq("id", userId);

  return { ok: true };
}

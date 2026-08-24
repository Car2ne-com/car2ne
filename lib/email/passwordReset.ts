import "server-only";

import { createHash, randomInt } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  getUserDisplayName,
  renderEmailHtml,
  sendTransactionalEmail,
} from "@/lib/email/brevo";

/*
 * Reset password via OTP inviato con Brevo (non il flusso nativo
 * "resetPasswordForEmail" di Supabase, abbandonato perché il link
 * monouso veniva consumato dal click-tracking di Brevo prima che
 * l'utente lo aprisse). Stesso pattern di lib/email/emailVerification.ts.
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

/*
 * L'Admin API di Supabase non offre un getUserByEmail diretto.
 * generateLink risolve email -> utente (errore se non esiste) senza
 * mandare nulla: scartiamo il link generato e usiamo solo `data.user`.
 */
export async function findUserByEmail(email: string) {
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function getResetCooldownSeconds(userId: string) {
  const admin = createAdminClient();

  const { data } = await admin
    .from("password_reset_codes")
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

export async function sendResetCode({
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
    .from("password_reset_codes")
    .delete()
    .eq("user_id", userId);

  const { error } = await admin
    .from("password_reset_codes")
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
    sender: "otp",
  });

  if (!sent) {
    throw new Error("Invio email di reset password fallito.");
  }
}

type VerifyResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not_found" | "expired" | "too_many_attempts" | "invalid";
    };

export async function verifyResetCode(
  userId: string,
  submittedCode: string
): Promise<VerifyResult> {
  const admin = createAdminClient();

  const { data: row } = await admin
    .from("password_reset_codes")
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
      .from("password_reset_codes")
      .delete()
      .eq("id", row.id);

    return { ok: false, reason: "expired" };
  }

  if (row.attempts >= MAX_ATTEMPTS) {
    await admin
      .from("password_reset_codes")
      .delete()
      .eq("id", row.id);

    return { ok: false, reason: "too_many_attempts" };
  }

  if (hashCode(submittedCode) !== row.code_hash) {
    await admin
      .from("password_reset_codes")
      .update({ attempts: row.attempts + 1 })
      .eq("id", row.id);

    return { ok: false, reason: "invalid" };
  }

  await admin
    .from("password_reset_codes")
    .delete()
    .eq("id", row.id);

  return { ok: true };
}

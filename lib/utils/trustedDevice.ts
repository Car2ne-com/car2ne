import type { SupabaseClient } from "@supabase/supabase-js";

export const TRUSTED_DEVICE_COOKIE =
  "car2ne_trusted_device";

export const TRUSTED_DEVICE_DAYS = 14;

/*
 * Usiamo la Web Crypto API (non "node:crypto")
 * perché questo file gira sia in Node (route
 * handler) sia nel runtime Edge (middleware).
 */

export function generateDeviceToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

export async function hashDeviceToken(
  token: string
): Promise<string> {
  const data = new TextEncoder().encode(token);

  const hashBuffer =
    await crypto.subtle.digest("SHA-256", data);

  return Array.from(
    new Uint8Array(hashBuffer)
  )
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

export async function isDeviceTrusted(
  supabase: SupabaseClient,
  userId: string,
  rawToken: string | undefined
): Promise<boolean> {
  if (!rawToken) {
    return false;
  }

  const tokenHash = await hashDeviceToken(
    rawToken
  );

  const { data } = await supabase
    .from("mfa_trusted_devices")
    .select("id")
    .eq("user_id", userId)
    .eq("token_hash", tokenHash)
    .gt(
      "expires_at",
      new Date().toISOString()
    )
    .maybeSingle();

  return !!data;
}

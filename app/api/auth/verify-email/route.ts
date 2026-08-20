import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { verifyEmailCode } from "@/lib/email/emailVerification";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "unauthenticated" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const code =
    typeof body?.code === "string" ? body.code.trim() : "";

  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "invalid" },
      { status: 400 }
    );
  }

  const result = await verifyEmailCode(user.id, code);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason },
      { status: 400 }
    );
  }

  return NextResponse.json({ verified: true });
}

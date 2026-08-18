import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTranslations } from "@/lib/i18n";
import {
  getUserDisplayName,
  renderEmailHtml,
  sendTransactionalEmail,
} from "@/lib/email/brevo";

/*
 * ==============================
 * ELIMINA ACCOUNT (self-service)
 * ==============================
 *
 * L'id utente viene sempre ricavato dalla sessione
 * autenticata (mai dal client), così ognuno può
 * eliminare solo il proprio account.
 *
 * Non cancelliamo fisicamente la riga in `profiles`:
 * `ratings.rater_id`/`ratee_id` hanno ON DELETE CASCADE,
 * quindi cancellare il profilo distruggerebbe anche le
 * recensioni lasciate da/verso altri utenti. Anonimizziamo
 * i dati personali e blocchiamo l'accesso (email fittizia,
 * password casuale, ban permanente) mantenendo intatta
 * l'integrità referenziale di passaggi, prenotazioni e chat.
 */

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Non autenticato." },
      { status: 401 }
    );
  }

  const [activeRides, openBookings] = await Promise.all([
    supabase
      .from("rides")
      .select("id", { count: "exact", head: true })
      .eq("driver_id", user.id)
      .eq("status", "active"),

    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("passenger_id", user.id)
      .in("status", ["pending", "confirmed"]),
  ]);

  if ((activeRides.count ?? 0) > 0) {
    return NextResponse.json(
      {
        error:
          "Hai ancora passaggi attivi come autista. Completali o annullali prima di eliminare l'account.",
      },
      { status: 409 }
    );
  }

  if ((openBookings.count ?? 0) > 0) {
    return NextResponse.json(
      {
        error:
          "Hai ancora prenotazioni in corso. Annullale prima di eliminare l'account.",
      },
      { status: 409 }
    );
  }

  const adminClient = createAdminClient();

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({
      name: "Utente",
      surname: "eliminato",
      avatar_url: null,
      phone: null,
      city: null,
      bio: null,
    })
    .eq("id", user.id);

  if (profileError) {
    console.error(
      "Errore anonimizzazione profilo:",
      profileError
    );

    return NextResponse.json(
      { error: profileError.message },
      { status: 500 }
    );
  }

  const { data: avatarFiles } = await adminClient.storage
    .from("avatars")
    .list(user.id);

  if (avatarFiles && avatarFiles.length > 0) {
    await adminClient.storage
      .from("avatars")
      .remove(
        avatarFiles.map(
          (file) => `${user.id}/${file.name}`
        )
      );
  }

  const { error: authError } =
    await adminClient.auth.admin.updateUserById(user.id, {
      email: `deleted-${user.id}@car2ne.invalid`,
      phone: "",
      password: randomUUID(),
      ban_duration: "876000h",
    });

  if (authError) {
    console.error(
      "Errore disattivazione account:",
      authError
    );

    return NextResponse.json(
      { error: authError.message },
      { status: 500 }
    );
  }

  if (user.email) {
    const { dict, locale } = await getTranslations();
    const copy = dict.email.accountDeleted;
    const name = getUserDisplayName(user, locale);

    await sendTransactionalEmail({
      to: { email: user.email },
      subject: copy.subject,
      htmlContent: renderEmailHtml({
        heading: copy.heading,
        body: copy.body.replace("{name}", name),
      }),
    });
  }

  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}

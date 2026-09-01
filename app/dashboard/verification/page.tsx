import { redirect } from "next/navigation";

import DriverVerificationForm from "@/components/dashboard/DriverVerificationForm";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";

export default async function DriverVerificationPage() {
  const supabase = await createClient();
  const { dict } = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: verification } = await supabase
    .from("driver_verifications")
    .select(
      "status, vehicle_make, vehicle_model, vehicle_plate, license_number, admin_note"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-3xl px-6 pt-40 pb-24">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-foreground">
            {dict.driverVerification.page.title}
          </h1>

          <p className="mt-4 text-lg text-muted-foreground">
            {dict.driverVerification.page.subtitle}
          </p>
        </div>

        <DriverVerificationForm
          dict={dict.driverVerification}
          verification={verification ?? null}
        />
    </main>
  );
}

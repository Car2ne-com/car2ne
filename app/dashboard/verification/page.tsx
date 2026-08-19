import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
    <>
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 pt-40 pb-24">
        <div className="mb-10">
          <h1 className="text-5xl font-black tracking-tight text-slate-900">
            {dict.driverVerification.page.title}
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            {dict.driverVerification.page.subtitle}
          </p>
        </div>

        <DriverVerificationForm
          dict={dict.driverVerification}
          verification={verification ?? null}
        />
      </main>

      <Footer />
    </>
  );
}

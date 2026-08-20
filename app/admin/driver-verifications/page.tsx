import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import AdminVerificationTable from "@/components/admin/AdminVerificationTable";
import { toOne } from "@/lib/utils/relations";
import { getTranslations } from "@/lib/i18n";

export default async function AdminDriverVerificationsPage() {
  const supabase = await createClient();
  const { dict } = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: verifications, error } = await supabase
    .from("driver_verifications")
    .select(
      `
      id,
      user_id,
      vehicle_make,
      vehicle_model,
      vehicle_plate,
      license_number,
      document_path,
      status,
      admin_note,
      created_at,
      driver:profiles!driver_verifications_user_id_fkey (
        name,
        surname
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const formatted = (verifications ?? []).map((v) => {
    const profile = toOne(v.driver);

    return {
      id: v.id,
      driverName: [profile?.name, profile?.surname]
        .filter(Boolean)
        .join(" "),
      vehicleMake: v.vehicle_make,
      vehicleModel: v.vehicle_model,
      vehiclePlate: v.vehicle_plate,
      licenseNumber: v.license_number,
      hasDocument: !!v.document_path,
      status: v.status,
      adminNote: v.admin_note,
      createdAt: v.created_at,
    };
  });

  return (
    <main className="mx-auto max-w-7xl p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {dict.admin.verificationsPage.title}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {dict.admin.verificationsPage.subtitle}
        </p>
      </div>

      <AdminVerificationTable
        verifications={formatted}
        dict={dict.admin.verificationTable}
      />
    </main>
  );
}

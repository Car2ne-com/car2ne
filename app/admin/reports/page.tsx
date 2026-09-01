import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import AdminReportTable from "@/components/admin/AdminReportTable";
import { toOne } from "@/lib/utils/relations";
import { getTranslations } from "@/lib/i18n";

export default async function AdminReportsPage() {
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

  const { data: reports, error } = await supabase
    .from("reports")
    .select(
      `
      id,
      category,
      description,
      status,
      admin_note,
      created_at,
      ride_id,
      booking_id,
      reporter:profiles!reports_reporter_id_fkey (
        name,
        surname
      ),
      reported:profiles!reports_reported_user_id_fkey (
        name,
        surname
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const formatted = (reports ?? []).map((r) => {
    const reporter = toOne(r.reporter);
    const reported = toOne(r.reported);

    return {
      id: r.id,
      category: r.category,
      description: r.description,
      status: r.status,
      adminNote: r.admin_note,
      createdAt: r.created_at,
      reporterName: [reporter?.name, reporter?.surname]
        .filter(Boolean)
        .join(" "),
      reportedName: reported
        ? [reported.name, reported.surname].filter(Boolean).join(" ")
        : null,
      hasRideRef: !!r.ride_id,
      hasBookingRef: !!r.booking_id,
    };
  });

  return (
    <main className="mx-auto max-w-7xl p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          {dict.admin.reportsPage.title}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {dict.admin.reportsPage.subtitle}
        </p>
      </div>

      <AdminReportTable reports={formatted} dict={dict.admin.reportTable} />
    </main>
  );
}

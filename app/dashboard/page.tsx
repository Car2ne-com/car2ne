import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardActions from "@/components/dashboard/DashboardActions";
import MyBookings from "@/components/dashboard/MyBookings";
import PushNotificationPrompt from "@/components/notifications/PushNotificationPrompt";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { dict } = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    profileResult,
    ridesResult,
    activeRidesResult,
    bookingsResult,
    ratingsResult,
    verificationResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single(),

    supabase
      .from("rides")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("driver_id", user.id),

    supabase
      .from("rides")
      .select("available_seats")
      .eq("driver_id", user.id)
      .eq("status", "active"),

    supabase
      .from("bookings")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("passenger_id", user.id),

    supabase
      .from("ratings")
      .select("rating")
      .eq("ratee_id", user.id),

    supabase
      .from("driver_verifications")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const seatsOffered =
    activeRidesResult.data?.reduce(
      (total, ride) =>
        total + (ride.available_seats ?? 0),
      0
    ) ?? 0;

  const ratings = ratingsResult.data ?? [];

  const ratingAverage =
    ratings.length > 0
      ? ratings.reduce(
          (total, r) => total + r.rating,
          0
        ) / ratings.length
      : null;

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-40 pb-24">
        <DashboardHeader
          name={
            profileResult.data?.name ?? "👋"
          }
        />

        <PushNotificationPrompt dict={dict.push} />

        <DashboardStats
          ridesCount={
            ridesResult.count ?? 0
          }
          bookingsCount={
            bookingsResult.count ?? 0
          }
          seatsOffered={seatsOffered}
          ratingAverage={ratingAverage}
          ratingsCount={ratings.length}
        />

        <DashboardActions
          dict={dict.driverVerification.dashboardCard}
          verificationStatus={
            verificationResult.data?.status ?? null
          }
        />

        <div className="mt-12">
          <MyBookings />
        </div>
      </main>

      <Footer />
    </>
  );
}

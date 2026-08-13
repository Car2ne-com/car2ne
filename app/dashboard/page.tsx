import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardActions from "@/components/dashboard/DashboardActions";
import MyBookings from "@/components/dashboard/MyBookings";

import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

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

        <DashboardActions />

        <div className="mt-12">
          <MyBookings />
        </div>
      </main>

      <Footer />
    </>
  );
}

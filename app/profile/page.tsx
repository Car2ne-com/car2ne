import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileForm from "@/components/profile/ProfileForm";
import PaymentMethodsForm from "@/components/profile/PaymentMethodsForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import MfaSettings from "@/components/profile/MfaSettings";
import DeleteAccountForm from "@/components/profile/DeleteAccountForm";
import BlockedUsersList from "@/components/profile/BlockedUsersList";
import RatingStars from "@/components/ratings/RatingStars";
import { Card } from "@/components/ui/card";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { dict } = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { data: blockRows } = await supabase
    .from("blocked_users")
    .select("blocked_id, blocked:profiles!blocked_users_blocked_id_fkey(name, surname)")
    .eq("blocker_id", user.id)
    .order("created_at", { ascending: false });

  const blockedUsers = (blockRows ?? []).map((row) => {
    const blockedProfile = Array.isArray(row.blocked)
      ? row.blocked[0]
      : row.blocked;

    return {
      id: row.blocked_id,
      name: blockedProfile
        ? `${blockedProfile.name ?? ""} ${blockedProfile.surname ?? ""}`.trim()
        : "",
    };
  });

  const { data: ratingRows } = await supabase
    .from("ratings")
    .select("rating, comment, created_at, rater_id")
    .eq("ratee_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const ratings = ratingRows ?? [];

  const raterIds = Array.from(
    new Set(ratings.map((rating) => rating.rater_id))
  );

  const { data: raterProfiles } =
    raterIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, name")
          .in("id", raterIds)
      : { data: [] as { id: string; name: string }[] };

  const raterNameById = new Map(
    (raterProfiles ?? []).map((rater) => [rater.id, rater.name])
  );

  const ratingAverage =
    ratings.length > 0
      ? ratings.reduce((total, r) => total + r.rating, 0) /
        ratings.length
      : null;

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 pt-28 pb-24">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-foreground">
            {dict.profile.title}
          </h1>

          <p className="mt-4 text-lg text-muted-foreground">
            {dict.profile.subtitle}
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-foreground">
                {dict.profile.myReviews.title}
              </h2>

              {ratingAverage !== null && (
                <div className="flex items-center gap-2">
                  <RatingStars
                    value={ratingAverage}
                    starLabel={dict.ratings.form.starLabel}
                  />

                  <span className="text-sm font-semibold text-muted-foreground">
                    {ratingAverage.toFixed(1)} ({ratings.length})
                  </span>
                </div>
              )}
            </div>

            {ratings.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                {dict.profile.myReviews.noReviewsYet}
              </p>
            ) : (
              <div className="mt-6 space-y-5">
                {ratings.map((rating, index) => (
                  <div
                    key={index}
                    className="border-t border-border pt-5 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-foreground">
                        {raterNameById.get(rating.rater_id) ??
                          dict.profile.myReviews.anonymousReviewerFallback}
                      </p>

                      <RatingStars
                        value={rating.rating}
                        size={16}
                        starLabel={dict.ratings.form.starLabel}
                      />
                    </div>

                    {rating.comment && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {rating.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <ProfileForm
            profile={{
              ...profile,
              email: user.email ?? "",
            }}
            dict={dict.profile.form}
          />

          <PaymentMethodsForm
            profile={{
              id: profile.id,
              payment_paypal_me: profile.payment_paypal_me,
              payment_revolut_me: profile.payment_revolut_me,
              payment_satispay_link: profile.payment_satispay_link,
            }}
            dict={dict.profile.paymentMethods}
          />

          <ChangePasswordForm dict={dict.profile.changePassword} />

          <MfaSettings dict={dict.profile.mfa} />

          <BlockedUsersList
            blockedUsers={blockedUsers}
            dict={dict.profile.blockedUsers}
          />

          <DeleteAccountForm
            dict={dict.profile.deleteAccount}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
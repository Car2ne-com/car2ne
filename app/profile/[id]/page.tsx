import { notFound, redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RatingStars from "@/components/ratings/RatingStars";
import VerifiedAvatar from "@/components/ui/VerifiedAvatar";
import BlockUserButton from "@/components/profile/BlockUserButton";
import { Card } from "@/components/ui/card";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PublicProfilePage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { dict } = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.id === id) {
    redirect("/profile");
  }

  /*
   * ==============================
   * CONTROLLO RELAZIONE
   * ==============================
   *
   * Il profilo pubblico e' visibile solo a chi ha
   * una prenotazione (anche in attesa) in comune
   * con l'utente richiesto, come conducente o
   * come passeggero.
   */

  const [
    asDriverResult,
    asPassengerResult,
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, rides!inner(driver_id)")
      .eq("passenger_id", id)
      .eq("rides.driver_id", user.id)
      .limit(1),

    supabase
      .from("bookings")
      .select("id, rides!inner(driver_id)")
      .eq("passenger_id", user.id)
      .eq("rides.driver_id", id)
      .limit(1),
  ]);

  const hasRelationship =
    (asDriverResult.data?.length ?? 0) > 0 ||
    (asPassengerResult.data?.length ?? 0) > 0;

  if (!hasRelationship) {
    notFound();
  }

  /*
   * ==============================
   * DATI PUBBLICI DEL PROFILO
   * ==============================
   *
   * Volutamente non includiamo telefono
   * ed email: sono dati sensibili.
   */

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, name, surname, avatar_url, city, bio, is_verified_driver"
    )
    .eq("id", id)
    .single();

  if (error || !profile) {
    notFound();
  }

  const { data: ratingRows } = await supabase
    .from("ratings")
    .select("rating, comment, created_at, rater_id")
    .eq("ratee_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const ratings = ratingRows ?? [];

  const { data: existingBlock } = await supabase
    .from("blocked_users")
    .select("id")
    .eq("blocker_id", user.id)
    .eq("blocked_id", id)
    .maybeSingle();

  const raterIds = Array.from(
    new Set(
      ratings.map((rating) => rating.rater_id)
    )
  );

  const { data: raterProfiles } =
    raterIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, name")
          .in("id", raterIds)
      : { data: [] as { id: string; name: string }[] };

  const raterNameById = new Map(
    (raterProfiles ?? []).map((rater) => [
      rater.id,
      rater.name,
    ])
  );

  const ratingAverage =
    ratings.length > 0
      ? ratings.reduce(
          (total, r) => total + r.rating,
          0
        ) / ratings.length
      : null;

  const displayName =
    `${profile.name} ${profile.surname}`.trim();

  const initials =
    `${profile.name.charAt(0)}${profile.surname.charAt(0)}`
      .toUpperCase();

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 pt-40 pb-24">
        <Card className="p-10">
          <div className="flex flex-col items-center text-center">
            <VerifiedAvatar
              src={profile.avatar_url}
              alt={displayName}
              initials={initials}
              isVerified={!!profile.is_verified_driver}
              verifiedLabel={dict.driverVerification.badge}
              size="lg"
            />

            <h1 className="mt-6 text-3xl font-medium text-foreground">
              {displayName}
            </h1>

            {profile.city && (
              <p className="mt-2 text-muted-foreground">
                {profile.city}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2">
              {ratingAverage !== null ? (
                <>
                  <RatingStars
                    value={ratingAverage}
                    starLabel={dict.ratings.form.starLabel}
                  />

                  <span className="text-sm font-semibold text-muted-foreground">
                    {ratingAverage.toFixed(1)} (
                    {ratings.length})
                  </span>
                </>
              ) : (
                <span className="rounded-full bg-muted px-4 py-1.5 text-xs font-semibold text-muted-foreground">
                  {dict.profile.publicProfile.noReviewsYet}
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="mt-6 max-w-xl text-muted-foreground">
                {profile.bio}
              </p>
            )}

            <BlockUserButton
              targetUserId={id}
              initiallyBlocked={!!existingBlock}
              reportButtonLabel={dict.profile.publicProfile.reportButton}
              dict={dict.profile.publicProfile.block}
            />
          </div>
        </Card>

        {ratings.length > 0 && (
          <Card id="reviews" className="mt-8 p-8">
            <h2 className="text-lg font-semibold text-foreground">
              {dict.profile.publicProfile.reviewsTitle}
            </h2>

            <div className="mt-6 space-y-5">
              {ratings.map((rating, index) => (
                <div
                  key={index}
                  className="border-t border-border pt-5 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-foreground">
                      {raterNameById.get(
                        rating.rater_id
                      ) ?? dict.profile.publicProfile.anonymousReviewerFallback}
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
          </Card>
        )}
      </main>

      <Footer />
    </>
  );
}

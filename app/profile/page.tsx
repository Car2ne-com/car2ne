import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileForm from "@/components/profile/ProfileForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import MfaSettings from "@/components/profile/MfaSettings";
import DeleteAccountForm from "@/components/profile/DeleteAccountForm";
import BlockedUsersList from "@/components/profile/BlockedUsersList";

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

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 pt-40 pb-24">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-foreground">
            {dict.profile.title}
          </h1>

          <p className="mt-4 text-lg text-muted-foreground">
            {dict.profile.subtitle}
          </p>
        </div>

        <div className="space-y-6">
          <ProfileForm
            profile={{
              ...profile,
              email: user.email ?? "",
            }}
            dict={dict.profile.form}
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
import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileForm from "@/components/profile/ProfileForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import MfaSettings from "@/components/profile/MfaSettings";
import DeleteAccountForm from "@/components/profile/DeleteAccountForm";

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

          <DeleteAccountForm
            dict={dict.profile.deleteAccount}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";

export default async function ResetPasswordPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/forgot-password");
  }

  const { dict } = await getTranslations();
  const t = dict.auth;

  return (
    <>
      <Navbar />

      <main className="mx-auto flex min-h-screen max-w-md items-center px-6 pt-28 pb-16">
        <div className="w-full">
          <div className="mb-10 text-center">
            <span className="inline-flex rounded-full border border-primary/20 bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
              {t.resetPassword.pageBadge}
            </span>

            <h1 className="mt-6 text-4xl font-black text-foreground">
              {t.resetPassword.pageTitle}
            </h1>

            <p className="mt-4 text-muted-foreground">
              {t.resetPassword.pageSubtitle}
            </p>
          </div>

          <ResetPasswordForm dict={t} />
        </div>
      </main>

      <Footer />
    </>
  );
}

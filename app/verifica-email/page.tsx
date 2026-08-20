import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function VerificaEmailPage({
  searchParams,
}: Props) {
  const supabase = await createClient();
  const { dict } = await getTranslations();
  const t = dict.auth.verifyEmail;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email_verified_at")
    .eq("id", user.id)
    .single();

  const { next } = await searchParams;

  if (profile?.email_verified_at) {
    const redirectTo =
      next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : "/dashboard";

    redirect(redirectTo);
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto flex min-h-screen max-w-md items-center px-6 pt-28 pb-16">
        <div className="w-full">
          <div className="mb-10 text-center">
            <span className="inline-flex rounded-full border border-primary/20 bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
              {t.pageBadge}
            </span>

            <h1 className="mt-6 text-4xl font-black text-foreground">
              {t.pageTitle}
            </h1>
          </div>

          <VerifyEmailForm
            email={user.email}
            next={next ?? null}
            dict={dict.auth}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}

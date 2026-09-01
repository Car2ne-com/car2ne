import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VerifyAgeForm from "@/components/auth/VerifyAgeForm";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function VerificaEtaPage({
  searchParams,
}: Props) {
  const supabase = await createClient();
  const { dict } = await getTranslations();
  const t = dict.auth.verifyAge;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.user_metadata?.birth_date) {
    redirect("/dashboard");
  }

  const { next } = await searchParams;

  return (
    <>
      <Navbar />

      <main className="mx-auto flex min-h-screen max-w-md items-center px-6 pt-28 pb-16">
        <div className="w-full">
          <div className="mb-10 text-center">
            <h1 className="mt-6 text-4xl font-medium text-foreground">
              {t.pageTitle}
            </h1>

            <p className="mt-4 text-muted-foreground">
              {t.pageSubtitle}
            </p>
          </div>

          <VerifyAgeForm
            next={next ?? null}
            dict={dict.auth}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}

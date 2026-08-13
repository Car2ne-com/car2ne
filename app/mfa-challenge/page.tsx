import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MfaChallengeForm from "@/components/auth/MfaChallengeForm";

import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function MfaChallengePage({
  searchParams,
}: Props) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { next } = await searchParams;

  return (
    <>
      <Navbar />

      <main className="mx-auto flex min-h-screen max-w-md items-center px-6 pt-28 pb-16">
        <div className="w-full">
          <div className="mb-10 text-center">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              🔒 Verifica in due passaggi
            </span>

            <h1 className="mt-6 text-4xl font-black text-slate-900">
              Conferma la tua identità
            </h1>

            <p className="mt-4 text-slate-600">
              Il tuo account ha l&apos;autenticazione
              a due fattori attiva.
            </p>
          </div>

          <MfaChallengeForm next={next ?? null} />
        </div>
      </main>

      <Footer />
    </>
  );
}

import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/forgot-password");
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto flex min-h-screen max-w-md items-center px-6 pt-28 pb-16">
        <div className="w-full">
          <div className="mb-10 text-center">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              🔑 Nuova password
            </span>

            <h1 className="mt-6 text-4xl font-black text-slate-900">
              Imposta una nuova password
            </h1>

            <p className="mt-4 text-slate-600">
              Scegli una password sicura per il
              tuo account.
            </p>
          </div>

          <ResetPasswordForm />
        </div>
      </main>

      <Footer />
    </>
  );
}

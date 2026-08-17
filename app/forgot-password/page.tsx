import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

import { getTranslations } from "@/lib/i18n";

export default async function ForgotPasswordPage() {
  const { dict } = await getTranslations();
  const t = dict.auth;

  return (
    <>
      <Navbar />

      <main className="mx-auto flex min-h-screen max-w-md items-center px-6 pt-28 pb-16">
        <div className="w-full">
          <div className="mb-10 text-center">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              {t.forgotPassword.pageBadge}
            </span>

            <h1 className="mt-6 text-4xl font-black text-slate-900">
              {t.forgotPassword.pageTitle}
            </h1>

            <p className="mt-4 text-slate-600">
              {t.forgotPassword.pageSubtitle}
            </p>
          </div>

          <ForgotPasswordForm dict={t} />
        </div>
      </main>

      <Footer />
    </>
  );
}

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/auth/LoginForm";

import { getTranslations } from "@/lib/i18n";

export default async function LoginPage() {
  const { dict } = await getTranslations();
  const t = dict.auth;

  return (
    <>
      <Navbar />

      <main className="mx-auto flex min-h-screen max-w-md items-center px-6 pt-28 pb-16">
        <div className="w-full">
          <div className="mb-10 text-center">
            <h1 className="mt-6 text-4xl font-medium text-foreground">
              {t.login.pageTitle}
            </h1>

            <p className="mt-4 text-muted-foreground">
              {t.login.pageSubtitle}
            </p>
          </div>

          <LoginForm dict={t} />
        </div>
      </main>

      <Footer />
    </>
  );
}
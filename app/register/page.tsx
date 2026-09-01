import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RegisterForm from "@/components/auth/RegisterForm";

import { getTranslations } from "@/lib/i18n";

export default async function RegisterPage() {
  const { dict } = await getTranslations();
  const t = dict.auth;

  return (
    <>
      <Navbar />

      <main className="mx-auto flex min-h-screen max-w-md items-center px-6 pt-40 pb-16">
        <div className="w-full">
          <div className="mb-10 text-center">
            <h1 className="mt-6 text-4xl font-medium tracking-tight text-foreground">
              {t.register.pageTitle}
            </h1>

            <p className="mt-4 text-muted-foreground">
              {t.register.pageSubtitle}
            </p>
          </div>

          <RegisterForm dict={t} />
        </div>
      </main>

      <Footer />
    </>
  );
}
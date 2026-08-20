import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ReportForm from "@/components/reports/ReportForm";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

import { getTranslations } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

export default async function SegnalaUnProblemaPage() {
  const { locale, dict } = await getTranslations();
  const t = dict.reports;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        <h1 className="text-4xl font-black text-foreground">
          {t.page.title}
        </h1>

        <p className="mt-4 text-muted-foreground">{t.page.intro}</p>

        {user ? (
          <ReportForm dict={t} locale={locale} />
        ) : (
          <Card className="mt-10 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">
              {t.guestNotice.title}
            </h2>

            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
              {t.guestNotice.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>

            <a
              href="mailto:report@car2ne.com"
              className={buttonVariants({
                size: "lg",
                className: "mt-8 h-12 w-full rounded-2xl px-8 text-base",
              })}
            >
              {t.guestNotice.cta}
            </a>
          </Card>
        )}
      </main>

      <Footer />
    </>
  );
}

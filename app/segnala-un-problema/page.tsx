import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ReportForm from "@/components/reports/ReportForm";

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
        <h1 className="text-4xl font-black text-slate-900">
          {t.page.title}
        </h1>

        <p className="mt-4 text-slate-600">{t.page.intro}</p>

        {user ? (
          <ReportForm dict={t} locale={locale} />
        ) : (
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              {t.guestNotice.title}
            </h2>

            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600">
              {t.guestNotice.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>

            <a
              href="mailto:report@car2ne.com"
              className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-500 px-8 text-base font-semibold text-white transition hover:bg-emerald-600"
            >
              {t.guestNotice.cta}
            </a>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

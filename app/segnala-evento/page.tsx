import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventSuggestionForm from "@/components/eventSuggestions/EventSuggestionForm";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

import { getTranslations } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

export default async function SegnalaEventoPage() {
  const { dict } = await getTranslations();
  const t = dict.eventSuggestions;

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
          <EventSuggestionForm dict={t} />
        ) : (
          <Card className="mt-10 p-8 text-center shadow-sm">
            <h2 className="text-lg font-bold text-foreground">
              {t.guestNotice.title}
            </h2>

            <p className="mt-2 text-muted-foreground">
              {t.guestNotice.description}
            </p>

            <a
              href="/login"
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

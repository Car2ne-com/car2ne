import type { Metadata } from "next";
import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AssistantPanel from "@/components/help/AssistantPanel";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

import { getTranslations } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getTranslations();
  const { title, description } = dict.help.meta;

  return {
    title,
    description,
    alternates: {
      canonical: "/aiuto",
    },
    openGraph: {
      title,
      description,
    },
  };
}

export default async function AiutoPage() {
  const { dict } = await getTranslations();
  const t = dict.help;

  const faqItems = t.faq.categories.flatMap((category) =>
    category.items.map((item) => ({
      q: item.q,
      a: item.a,
      category: category.title,
    }))
  );

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.categories.flatMap((category) =>
      category.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      }))
    ),
  };

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

        <section>
          <h1 className="text-[2.25rem] leading-[1.08] font-medium tracking-tight text-foreground md:text-5xl">
            {t.hero.title}
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            {t.hero.subtitle}
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-semibold text-foreground">
            {t.guide.title}
          </h2>

          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {t.guide.steps.map((step, index) => (
              <li key={step.title}>
                <Card className="h-full p-5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>

                  <h3 className="mt-4 font-bold text-foreground">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <AssistantPanel dict={t.assistant} faqItems={faqItems} />

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {t.faq.title}
          </h2>

          <div className="mt-8 space-y-10">
            {t.faq.categories.map((category) => (
              <div key={category.id}>
                <h3 className="text-lg font-bold text-foreground">
                  {category.title}
                </h3>

                <div className="mt-3 divide-y divide-border border-t border-border">
                  {category.items.map((item) => (
                    <details key={item.q} className="group py-3">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                        {item.q}

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </summary>

                      <p className="mt-2 pr-8 text-sm leading-7 text-muted-foreground">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Card className="mt-16 p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {t.contact.title}
          </h2>

          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            {t.contact.description}
          </p>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <dt className="font-semibold text-foreground">
                {t.contact.reportEmailLabel}
              </dt>
              <dd>
                <a
                  href={`mailto:${t.contact.reportEmail}`}
                  className="font-medium text-primary hover:underline"
                >
                  {t.contact.reportEmail}
                </a>
              </dd>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <dt className="font-semibold text-foreground">
                {t.contact.privacyEmailLabel}
              </dt>
              <dd>
                <a
                  href={`mailto:${t.contact.privacyEmail}`}
                  className="font-medium text-primary hover:underline"
                >
                  {t.contact.privacyEmail}
                </a>
              </dd>
            </div>
          </dl>

          <Link
            href="/segnala-un-problema"
            className={buttonVariants({
              size: "lg",
              className: "mt-8 h-12 w-full px-8 text-base",
            })}
          >
            {t.contact.reportCta}
          </Link>
        </Card>
      </main>

      <Footer />
    </>
  );
}

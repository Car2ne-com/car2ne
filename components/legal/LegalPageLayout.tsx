import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { getTranslations } from "@/lib/i18n";

type Props = {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
};

export default async function LegalPageLayout({
  title,
  updatedAt,
  children,
}: Props) {
  const { dict } = await getTranslations();

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        <h1 className="text-4xl font-medium text-foreground">
          {title}
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          {dict.legal.lastUpdated}: {updatedAt}
        </p>

        <div className="mt-10 space-y-10">
          {children}
        </div>
      </main>

      <Footer />
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground">
        {title}
      </h2>

      <div className="mt-3 space-y-4 text-sm leading-7 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

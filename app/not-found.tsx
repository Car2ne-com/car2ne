import Link from "next/link";
import { SearchX } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import { getTranslations } from "@/lib/i18n";

export default async function NotFound() {
  const { dict } = await getTranslations();
  const t = dict.layout.notFound;

  return (
    <>
      <Navbar />

      <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6 pt-28 pb-16">
        <EmptyState icon={SearchX} title={t.title} description={t.description} className="w-full border-none bg-transparent">
          <Link href="/" className="mt-8">
            <Button size="lg">{t.cta}</Button>
          </Link>
        </EmptyState>
      </main>

      <Footer />
    </>
  );
}

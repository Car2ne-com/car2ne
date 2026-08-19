import { notFound, redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BetaChecklistForm from "@/components/betaChecklist/BetaChecklistForm";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
import { isBetaChecklistEnabled } from "@/lib/betaChecklist/config";
import type { BetaChecklistResultsByItem, BetaChecklistStatus } from "@/types/betaChecklist";

export default async function BetaChecklistPage() {
  if (!isBetaChecklistEnabled) {
    notFound();
  }

  const supabase = await createClient();
  const { dict } = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rows, error } = await supabase
    .from("beta_checklist_results")
    .select("item_id, status, note")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  const initialResults: BetaChecklistResultsByItem = {};
  for (const row of rows ?? []) {
    initialResults[row.item_id as string] = {
      status: row.status as BetaChecklistStatus,
      note: (row.note as string | null) ?? "",
    };
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 pt-40 pb-24">
        <div className="mb-10">
          <p className="text-xs font-bold tracking-widest text-emerald-600 uppercase">
            {dict.betaChecklist.meta.eyebrow}
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
            {dict.betaChecklist.meta.title}
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            {dict.betaChecklist.meta.subtitle}
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">
              {dict.betaChecklist.meta.howToTitle}
            </p>
            <p className="mt-1 leading-6">{dict.betaChecklist.meta.howToBody}</p>
          </div>
        </div>

        <BetaChecklistForm
          userId={user.id}
          sections={dict.betaChecklist.sections}
          initialResults={initialResults}
          dict={{
            progress: dict.betaChecklist.progress,
            states: dict.betaChecklist.states,
            expectedLabel: dict.betaChecklist.expectedLabel,
            notePlaceholder: dict.betaChecklist.notePlaceholder,
            saveErrorToast: dict.betaChecklist.saveErrorToast,
          }}
        />
      </main>

      <Footer />
    </>
  );
}

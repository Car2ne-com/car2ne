import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTranslations } from "@/lib/i18n";
import { isBetaChecklistEnabled } from "@/lib/betaChecklist/config";
import type { BetaChecklistStatus } from "@/types/betaChecklist";
import { Card } from "@/components/ui/card";

type ResultRow = {
  user_id: string;
  item_id: string;
  status: BetaChecklistStatus;
  note: string | null;
  updated_at: string;
};

export default async function AdminBetaChecklistPage() {
  if (!isBetaChecklistEnabled) {
    notFound();
  }

  const { supabase } = await requireAdmin();
  const { dict } = await getTranslations();
  const adminClient = createAdminClient();

  const [resultsRes, authUsersRes, profilesRes] = await Promise.all([
    supabase
      .from("beta_checklist_results")
      .select("user_id, item_id, status, note, updated_at")
      .order("updated_at", { ascending: false }),

    adminClient.auth.admin.listUsers({ perPage: 1000 }),

    adminClient.from("profiles").select("id, name, surname"),
  ]);

  if (resultsRes.error) {
    throw new Error(resultsRes.error.message);
  }

  if (authUsersRes.error) {
    throw new Error(authUsersRes.error.message);
  }

  if (profilesRes.error) {
    throw new Error(profilesRes.error.message);
  }

  const rows = (resultsRes.data ?? []) as ResultRow[];

  const profileById = new Map(
    (profilesRes.data ?? []).map((profile) => [profile.id as string, profile])
  );
  const emailById = new Map(
    authUsersRes.data.users.map((u) => [u.id, u.email ?? "—"])
  );

  function testerLabel(userId: string) {
    const profile = profileById.get(userId);
    const name = `${profile?.name ?? ""} ${profile?.surname ?? ""}`.trim();
    return name || emailById.get(userId) || dict.betaChecklist.admin.unnamedTester;
  }

  const itemLookup = new Map<string, { itemTitle: string; sectionTitle: string }>();
  for (const section of dict.betaChecklist.sections) {
    for (const item of section.items) {
      itemLookup.set(item.id, { itemTitle: item.title, sectionTitle: section.title });
    }
  }

  const totalItems = dict.betaChecklist.sections.reduce(
    (total, section) => total + section.items.length,
    0
  );

  const statsByUser = new Map<string, { ok: number; problem: number }>();
  for (const row of rows) {
    const stats = statsByUser.get(row.user_id) ?? { ok: 0, problem: 0 };
    if (row.status === "ok") stats.ok++;
    else if (row.status === "problem") stats.problem++;
    statsByUser.set(row.user_id, stats);
  }

  const testers = Array.from(statsByUser.entries())
    .map(([userId, stats]) => ({
      userId,
      label: testerLabel(userId),
      ...stats,
      tested: stats.ok + stats.problem,
    }))
    .sort((a, b) => b.tested - a.tested);

  const problems = rows
    .filter((row) => row.status === "problem")
    .map((row) => ({
      ...row,
      testerLabel: testerLabel(row.user_id),
      itemTitle: itemLookup.get(row.item_id)?.itemTitle ?? row.item_id,
      sectionTitle: itemLookup.get(row.item_id)?.sectionTitle ?? "",
    }));

  return (
    <main className="mx-auto max-w-7xl p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {dict.betaChecklist.admin.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{dict.betaChecklist.admin.subtitle}</p>
      </div>

      {testers.length === 0 ? (
        <Card className="p-8 text-muted-foreground">
          {dict.betaChecklist.admin.noResults}
        </Card>
      ) : (
        <>
          <Card className="p-0">
            <div className="border-b border-border p-6">
              <h2 className="text-lg font-semibold text-foreground">
                {dict.betaChecklist.admin.testersHeading}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground uppercase">
                    <th className="px-6 py-3">{dict.betaChecklist.admin.testerColumn}</th>
                    <th className="px-6 py-3">{dict.betaChecklist.admin.testedColumn}</th>
                    <th className="px-6 py-3 text-primary">
                      {dict.betaChecklist.admin.okColumn}
                    </th>
                    <th className="px-6 py-3 text-destructive">
                      {dict.betaChecklist.admin.problemColumn}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {testers.map((tester) => (
                    <tr key={tester.userId} className="border-b border-border/60 last:border-0">
                      <td className="px-6 py-3 font-medium text-foreground/90">{tester.label}</td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {tester.tested} / {totalItems}
                      </td>
                      <td className="px-6 py-3 font-semibold text-primary">{tester.ok}</td>
                      <td className="px-6 py-3 font-semibold text-destructive">{tester.problem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <section className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {dict.betaChecklist.admin.problemsHeading}
            </h2>

            {problems.length === 0 ? (
              <Card className="p-8 text-muted-foreground">
                {dict.betaChecklist.admin.noProblems}
              </Card>
            ) : (
              <ul className="space-y-3">
                {problems.map((problem) => (
                  <li
                    key={`${problem.user_id}-${problem.item_id}`}
                    className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground/90">
                        {problem.sectionTitle} · {problem.itemTitle}
                      </p>
                      <span className="text-xs text-muted-foreground/70">
                        {problem.testerLabel} ·{" "}
                        {new Date(problem.updated_at).toLocaleString("it-IT", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-foreground/80">
                      {problem.note?.trim() || dict.betaChecklist.admin.noteFallback}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}

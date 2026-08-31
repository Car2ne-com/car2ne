import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { romeDay } from "@/lib/utils/date";
import AdminTrendChart from "@/components/admin/AdminTrendChart";
import AdminCategoryBreakdown from "@/components/admin/AdminCategoryBreakdown";
import { getTranslations } from "@/lib/i18n";

type PaymentMethod = "paypal" | "revolut" | "satispay" | "in_person";

const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  paypal: "#003087",
  revolut: "#000000",
  satispay: "#FF3D00",
  in_person: "#10b981",
};

const DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

function buildLastDays(now: Date, days: number): string[] {
  const result: string[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    result.push(romeDay(new Date(now.getTime() - i * DAY_MS)));
  }

  return result;
}

function bucketByDay(
  rows: { created_at: string }[],
  days: string[]
): { date: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const day of days) {
    counts.set(day, 0);
  }

  for (const row of rows) {
    const day = romeDay(new Date(row.created_at));

    if (counts.has(day)) {
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
  }

  return days.map((date) => ({
    date: date.slice(5),
    count: counts.get(date) ?? 0,
  }));
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const adminClient = createAdminClient();
  const { dict } = await getTranslations();
  const t = dict.admin.analyticsPage;

  const now = new Date();
  const days = buildLastDays(now, DAYS);
  const sinceIso = new Date(
    now.getTime() - (DAYS - 1) * DAY_MS
  ).toISOString();

  const [
    usersResult,
    ridesResult,
    bookingsResult,
    paymentMethodsResult,
  ] = await Promise.all([
    adminClient
      .from("profiles")
      .select("created_at")
      .gte("created_at", sinceIso),

    adminClient
      .from("rides")
      .select("created_at")
      .gte("created_at", sinceIso),

    adminClient
      .from("bookings")
      .select("created_at")
      .gte("created_at", sinceIso),

    adminClient
      .from("bookings")
      .select("payment_method")
      .not("paid_at", "is", null),
  ]);

  const usersSeries = bucketByDay(usersResult.data ?? [], days);
  const ridesSeries = bucketByDay(ridesResult.data ?? [], days);
  const bookingsSeries = bucketByDay(bookingsResult.data ?? [], days);

  const paymentMethodCounts = new Map<PaymentMethod, number>();

  for (const row of paymentMethodsResult.data ?? []) {
    const method = row.payment_method as PaymentMethod | null;

    if (!method) {
      continue;
    }

    paymentMethodCounts.set(
      method,
      (paymentMethodCounts.get(method) ?? 0) + 1
    );
  }

  const paymentMethodCategories = (
    [
      ["paypal", t.paymentMethodsBreakdown.paypal],
      ["revolut", t.paymentMethodsBreakdown.revolut],
      ["satispay", t.paymentMethodsBreakdown.satispay],
      ["in_person", t.paymentMethodsBreakdown.inPerson],
    ] as [PaymentMethod, string][]
  ).map(([method, label]) => ({
    label,
    count: paymentMethodCounts.get(method) ?? 0,
    color: PAYMENT_METHOD_COLORS[method],
  }));

  const hasError =
    usersResult.error ||
    ridesResult.error ||
    bookingsResult.error ||
    paymentMethodsResult.error;

  return (
    <main className="mx-auto max-w-7xl p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>

        <p className="mt-2 text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      {hasError ? (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
          {t.dataUnavailable}
        </div>
      ) : (
        <div className="space-y-6">
          <AdminTrendChart
            title={t.newUsersPerDay}
            data={usersSeries}
            color="#10b981"
            last30DaysLabel={dict.admin.trendChart.last30Days}
          />

          <AdminTrendChart
            title={t.newRidesPerDay}
            data={ridesSeries}
            color="#0ea5e9"
            last30DaysLabel={dict.admin.trendChart.last30Days}
          />

          <AdminTrendChart
            title={t.newBookingsPerDay}
            data={bookingsSeries}
            color="#f59e0b"
            last30DaysLabel={dict.admin.trendChart.last30Days}
          />

          <AdminCategoryBreakdown
            title={t.paymentMethodsBreakdown.title}
            subtitle={t.paymentMethodsBreakdown.subtitle}
            categories={paymentMethodCategories}
            emptyLabel={t.paymentMethodsBreakdown.empty}
          />
        </div>
      )}
    </main>
  );
}

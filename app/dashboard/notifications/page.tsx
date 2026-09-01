import { redirect } from "next/navigation";
import Link from "next/link";

import { Bell } from "lucide-react";

import PushNotificationToggle from "@/components/notifications/PushNotificationToggle";
import { EmptyState } from "@/components/ui/empty-state";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
import {
  getNotificationHref,
  getNotificationIcon,
} from "@/lib/utils/notifications";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { dict } = await getTranslations();
  const t = dict.dashboardNotifications;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: notifications, error } =
    await supabase
      .from("notifications")
      .select(`
        id,
        type,
        title,
        message,
        booking_id,
        ride_id,
        is_read,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw new Error(error.message);
  }

  const notificationList =
    notifications ?? [];

  const unreadCount =
    notificationList.filter(
      (notification) =>
        !notification.is_read
    ).length;

  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-28">

        {/* Header */}

        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">
              {t.title}
            </h1>

            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-sm font-semibold text-accent-foreground">
                {unreadCount} {t.unreadLabel.toLowerCase()}
              </span>
            )}
          </div>

          <p className="mt-4 text-lg text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        <PushNotificationToggle dict={dict.push} />

        {/* Nessuna notifica */}

        {notificationList.length === 0 ? (

          <div className="text-center">
            <EmptyState
              icon={Bell}
              title={t.emptyTitle}
              description={t.emptyDescription}
            />

            <Link
              href="/events"
              className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {t.findEvent}
            </Link>
          </div>

        ) : (

          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">

            {notificationList.map(
              (notification) => {

                const isUnread =
                  !notification.is_read;

                const href = getNotificationHref(
                  notification
                );

                const icon = getNotificationIcon(
                  notification.type,
                  "md"
                );

                return (
                  <Link
                    key={notification.id}
                    href={href}
                    className={`flex gap-5 border-b border-border p-6 transition last:border-b-0 hover:bg-muted ${
                      isUnread
                        ? "bg-accent/40"
                        : "bg-card"
                    }`}
                  >

                    {icon}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start gap-2">
                        <h3 className="font-semibold text-foreground">
                          {notification.title}
                        </h3>

                        {isUnread && (
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>

                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {new Date(
                          notification.created_at
                        ).toLocaleString(
                          "it-IT",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>

                      <p className="mt-2 leading-6 text-muted-foreground">
                        {notification.message}
                      </p>

                      <p className="mt-3 text-sm font-semibold text-primary">
                        {t.viewLink}
                      </p>

                    </div>

                  </Link>
                );
              }
            )}

          </div>
        )}

    </main>
  );
}
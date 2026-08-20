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
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-40">

        {/* Header */}

        <div className="mb-10 flex items-start justify-between gap-6">

          <div>
            <span className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
              🔔 Notifiche
            </span>

            <h1 className="mt-5 text-2xl font-bold text-foreground">
              Le tue notifiche
            </h1>

            <p className="mt-4 text-lg text-muted-foreground">
              Tieni sotto controllo richieste,
              prenotazioni e aggiornamenti.
            </p>
          </div>

          {unreadCount > 0 && (
            <div className="shrink-0 rounded-2xl bg-accent px-5 py-4 text-center">
              <p className="text-xs font-semibold text-accent-foreground">
                Non lette
              </p>

              <p className="mt-1 text-2xl font-black text-accent-foreground">
                {unreadCount}
              </p>
            </div>
          )}

        </div>

        <PushNotificationToggle dict={dict.push} />

        {/* Nessuna notifica */}

        {notificationList.length === 0 ? (

          <div className="text-center">
            <EmptyState
              icon={Bell}
              title="Nessuna notifica"
              description="Qui troverai le richieste di prenotazione e tutti gli aggiornamenti sui tuoi passaggi."
            />

            <Link
              href="/events"
              className="mt-8 inline-flex rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Cerca un evento
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

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex items-center gap-2">

                          <h2 className="font-bold text-foreground">
                            {notification.title}
                          </h2>

                          {isUnread && (
                            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                          )}

                        </div>

                        <span className="shrink-0 text-xs text-muted-foreground">
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

                      </div>

                      <p className="mt-2 leading-6 text-muted-foreground">
                        {notification.message}
                      </p>

                      <p className="mt-3 text-sm font-semibold text-primary">
                        Visualizza →
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
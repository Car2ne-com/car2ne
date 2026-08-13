import { redirect } from "next/navigation";
import Link from "next/link";

import { Bell } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { createClient } from "@/lib/supabase/server";
import {
  getNotificationHref,
  getNotificationIcon,
} from "@/lib/utils/notifications";

export default async function NotificationsPage() {
  const supabase = await createClient();

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
    <>
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 pb-24 pt-40">

        {/* Header */}

        <div className="mb-10 flex items-start justify-between gap-6">

          <div>
            <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              🔔 Notifiche
            </span>

            <h1 className="mt-5 text-5xl font-black tracking-tight text-slate-900">
              Le tue notifiche
            </h1>

            <p className="mt-4 text-lg text-slate-600">
              Tieni sotto controllo richieste,
              prenotazioni e aggiornamenti.
            </p>
          </div>

          {unreadCount > 0 && (
            <div className="shrink-0 rounded-2xl bg-emerald-50 px-5 py-4 text-center">
              <p className="text-xs font-semibold text-emerald-600">
                Non lette
              </p>

              <p className="mt-1 text-2xl font-black text-emerald-700">
                {unreadCount}
              </p>
            </div>
          )}

        </div>

        {/* Nessuna notifica */}

        {notificationList.length === 0 ? (

          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-8 py-20 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <Bell className="h-9 w-9 text-emerald-600" />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              Nessuna notifica
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-slate-500">
              Qui troverai le richieste di
              prenotazione e tutti gli aggiornamenti
              sui tuoi passaggi.
            </p>

            <Link
              href="/events"
              className="mt-8 inline-flex rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
            >
              Cerca un evento
            </Link>

          </div>

        ) : (

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

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
                    className={`flex gap-5 border-b border-slate-100 p-6 transition last:border-b-0 hover:bg-slate-50 ${
                      isUnread
                        ? "bg-emerald-50/40"
                        : "bg-white"
                    }`}
                  >

                    {icon}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex items-center gap-2">

                          <h2 className="font-bold text-slate-900">
                            {notification.title}
                          </h2>

                          {isUnread && (
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          )}

                        </div>

                        <span className="shrink-0 text-xs text-slate-400">
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

                      <p className="mt-2 leading-6 text-slate-600">
                        {notification.message}
                      </p>

                      <p className="mt-3 text-sm font-semibold text-emerald-600">
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

      <Footer />
    </>
  );
}
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import { Bell, MessageCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  getNotificationHref,
  getNotificationIcon,
} from "@/lib/utils/notifications";
import type { Locale } from "@/lib/i18n/locales";

type NotificationsDict = {
  ariaLabel: string;
  title: string;
  unreadItemsSuffix: string;
  markAllRead: string;
  messagesTitle: string;
  unreadMessageSingular: string;
  unreadMessagePlural: string;
  openChats: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  viewAll: string;
};

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  booking_id: string | null;
  ride_id: string | null;
  is_read: boolean;
  created_at: string;
};

type AuthUser = {
  id: string;
};

type Props = {
  locale: Locale;
  dict: NotificationsDict;
};

export default function NotificationBell({ locale, dict }: Props) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  /*
   * ==============================
   * AUTH
   * ==============================
   */

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  /*
   * ==============================
   * NOTIFICHE
   * ==============================
   */

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [
    unreadMessagesCount,
    setUnreadMessagesCount,
  ] = useState(0);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const containerRef =
    useRef<HTMLDivElement>(null);

  /*
   * ==============================
   * CARICAMENTO DATI
   * ==============================
   */

  const loadNotifications =
    useCallback(async () => {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      /*
       * Utente non autenticato
       */

      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        setUnreadMessagesCount(0);
        setLoading(false);

        return;
      }

      /*
       * ==============================
       * NOTIFICHE
       * ==============================
       */

      const {
        data: notificationData,
        error: notificationError,
      } = await supabase
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
        })
        .limit(10);

      if (notificationError) {
        console.error(
          "Errore caricamento notifiche:",
          notificationError
        );
      } else {
        const notificationList =
          notificationData ?? [];

        setNotifications(
          notificationList as Notification[]
        );

        setUnreadCount(
          notificationList.filter(
            (notification) =>
              !notification.is_read
          ).length
        );
      }

      /*
       * ==============================
       * CONVERSAZIONI
       * ==============================
       */

      const {
        data: conversations,
        error: conversationsError,
      } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `driver_id.eq.${user.id},passenger_id.eq.${user.id}`
        );

      if (conversationsError) {
        console.error(
          "Errore caricamento conversazioni:",
          conversationsError
        );

        setUnreadMessagesCount(0);
        setLoading(false);

        return;
      }

      if (
        !conversations ||
        conversations.length === 0
      ) {
        setUnreadMessagesCount(0);
        setLoading(false);

        return;
      }

      /*
       * ==============================
       * MESSAGGI NON LETTI
       * ==============================
       */

      const conversationIds =
        conversations.map(
          (conversation) =>
            conversation.id
        );

      const {
        count,
        error: messagesError,
      } = await supabase
        .from("messages")
        .select("id", {
          count: "exact",
          head: true,
        })
        .in(
          "conversation_id",
          conversationIds
        )
        .neq(
          "sender_id",
          user.id
        )
        .is("read_at", null);

      if (messagesError) {
        console.error(
          "Errore conteggio messaggi non letti:",
          messagesError
        );

        setUnreadMessagesCount(0);
      } else {
        setUnreadMessagesCount(
          count ?? 0
        );
      }

      setLoading(false);
    }, [supabase]);

  /*
   * ==============================
   * CONTROLLO AUTH
   * ==============================
   */

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      setUser(
        user
          ? {
              id: user.id,
            }
          : null
      );

      setAuthLoading(false);
    }

    void initializeAuth();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!mounted) {
            return;
          }

          const nextUser =
            session?.user
              ? {
                  id: session.user.id,
                }
              : null;

          setUser(nextUser);
          setAuthLoading(false);
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  /*
   * ==============================
   * REALTIME
   * ==============================
   */

  useEffect(() => {
    /*
     * Se non siamo loggati
     * non creiamo nessun canale realtime.
     */

    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setUnreadMessagesCount(0);
      setLoading(false);

      return;
    }

    setLoading(true);

    void loadNotifications();

    /*
     * Un unico canale Realtime
     * per notifiche e messaggi.
     */

    const channel = supabase
      .channel(
        `navbar-realtime-${user.id}`
      )

      /*
       * ==============================
       * NUOVE NOTIFICHE
       * ==============================
       */

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        () => {
          void loadNotifications();
        }
      )

      /*
       * ==============================
       * AGGIORNAMENTO NOTIFICHE
       * ==============================
       */

      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
        },
        () => {
          void loadNotifications();
        }
      )

      /*
       * ==============================
       * NUOVI MESSAGGI
       * ==============================
       */

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          void loadNotifications();
        }
      )

      /*
       * ==============================
       * MESSAGGI AGGIORNATI
       * ==============================
       */

      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        () => {
          void loadNotifications();
        }
      )

      .subscribe();

    return () => {
      void supabase.removeChannel(
        channel
      );
    };
  }, [
    user,
    loadNotifications,
    supabase,
  ]);

  /*
   * ==============================
   * CLICK OUTSIDE
   * ==============================
   */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * ==============================
   * CONTATORE TOTALE
   * ==============================
   */

  const totalUnread =
    unreadCount +
    unreadMessagesCount;

  /*
   * ==============================
   * SEGNA NOTIFICA COME LETTA
   * ==============================
   */

  async function markAsRead(
    notificationId: string
  ) {
    const { error } =
      await supabase
        .from("notifications")
        .update({
          is_read: true,
        })
        .eq(
          "id",
          notificationId
        );

    if (error) {
      console.error(
        "Errore aggiornamento notifica:",
        error
      );

      return;
    }

    setNotifications((current) =>
      current.map(
        (notification) =>
          notification.id ===
          notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification
      )
    );

    setUnreadCount((current) =>
      Math.max(0, current - 1)
    );
  }

  /*
   * ==============================
   * SEGNA TUTTE COME LETTE
   * ==============================
   */

  async function markAllAsRead() {
    const unreadIds =
      notifications
        .filter(
          (notification) =>
            !notification.is_read
        )
        .map(
          (notification) =>
            notification.id
        );

    if (
      unreadIds.length === 0
    ) {
      return;
    }

    const { error } =
      await supabase
        .from("notifications")
        .update({
          is_read: true,
        })
        .in(
          "id",
          unreadIds
        );

    if (error) {
      console.error(
        "Errore aggiornamento notifiche:",
        error
      );

      return;
    }

    setNotifications((current) =>
      current.map(
        (notification) => ({
          ...notification,
          is_read: true,
        })
      )
    );

    setUnreadCount(0);
  }

  /*
   * ==============================
   * DATA
   * ==============================
   */

  function formatDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleString(
      locale === "en" ? "en-US" : "it-IT",
      {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  /*
   * ==============================
   * NON LOGGATO
   * ==============================
   *
   * Durante il caricamento auth
   * non mostriamo nulla.
   *
   * Se non c'è un utente autenticato
   * la campanella sparisce completamente.
   */

  if (
    authLoading ||
    !user
  ) {
    return null;
  }

  /*
   * ==============================
   * RENDER
   * ==============================
   */

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
        aria-label={dict.ariaLabel}
      >
        <Bell className="h-5 w-5" />

        {totalUnread > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white shadow-sm">
            {totalUnread > 9
              ? "9+"
              : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="
            fixed inset-x-4 top-20 z-50 max-h-[calc(100vh-96px)]
            overflow-hidden rounded-3xl border border-slate-200
            bg-white shadow-2xl
            sm:absolute sm:inset-x-auto sm:right-0 sm:top-14 sm:max-h-none
            sm:w-[380px] sm:max-w-[calc(100vw-32px)]
          "
        >

          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

            <div>
              <h3 className="font-bold text-slate-900">
                {dict.title}
              </h3>

              {totalUnread > 0 && (
                <p className="mt-0.5 text-xs text-slate-500">
                  {totalUnread} {dict.unreadItemsSuffix}
                </p>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={
                  markAllAsRead
                }
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                {dict.markAllRead}
              </button>
            )}

          </div>

          {/* MESSAGGI */}

          {unreadMessagesCount >
            0 && (
            <Link
              href="/chat"
              onClick={() =>
                setOpen(false)
              }
              className="flex items-center gap-3 border-b border-slate-100 bg-emerald-50/60 px-5 py-4 transition hover:bg-emerald-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
              </div>

              <div className="min-w-0 flex-1">

                <div className="flex items-center justify-between gap-3">

                  <p className="text-sm font-bold text-slate-900">
                    {dict.messagesTitle}
                  </p>

                  <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {unreadMessagesCount >
                    9
                      ? "9+"
                      : unreadMessagesCount}
                  </span>

                </div>

                <p className="mt-1 text-sm text-slate-600">
                  {(unreadMessagesCount === 1
                    ? dict.unreadMessageSingular
                    : dict.unreadMessagePlural
                  ).replace("{count}", String(unreadMessagesCount))}
                </p>

                <p className="mt-1 text-xs font-semibold text-emerald-600">
                  {dict.openChats}
                </p>

              </div>
            </Link>
          )}

          {/* LISTA */}

          <div className="max-h-[420px] overflow-y-auto">

            {loading ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                {dict.loading}
              </div>
            ) : notifications.length ===
              0 ? (

              <div className="px-5 py-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <Bell className="h-7 w-7 text-slate-400" />
                </div>

                <h4 className="mt-4 font-bold text-slate-900">
                  {dict.emptyTitle}
                </h4>

                <p className="mt-2 text-sm text-slate-500">
                  {dict.emptyDescription}
                </p>

              </div>

            ) : (

              <div>
                {notifications.map(
                  (
                    notification
                  ) => {
                    const href =
                      getNotificationHref(
                        notification
                      );

                    return (
                      <Link
                        key={
                          notification.id
                        }
                        href={
                          href
                        }
                        onClick={() => {
                          if (
                            !notification.is_read
                          ) {
                            void markAsRead(
                              notification.id
                            );
                          }

                          setOpen(
                            false
                          );
                        }}
                        className={`flex gap-3 border-b border-slate-100 px-5 py-4 transition hover:bg-slate-50 ${
                          !notification.is_read
                            ? "bg-emerald-50/50"
                            : ""
                        }`}
                      >

                        {getNotificationIcon(
                          notification.type
                        )}

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-3">

                            <p className="text-sm font-bold text-slate-900">
                              {
                                notification.title
                              }
                            </p>

                            {!notification.is_read && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                            )}

                          </div>

                          <p className="mt-1 text-sm leading-5 text-slate-600">
                            {
                              notification.message
                            }
                          </p>

                          <p className="mt-2 text-[11px] text-slate-400">
                            {formatDate(
                              notification.created_at
                            )}
                          </p>

                        </div>

                      </Link>
                    );
                  }
                )}
              </div>

            )}

          </div>

          {/* FOOTER */}

          <div className="border-t border-slate-100 px-5 py-3 text-center">

            <Link
              href="/dashboard/notifications"
              onClick={() =>
                setOpen(false)
              }
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              {dict.viewAll}
            </Link>

          </div>

        </div>
      )}
    </div>
  );
}
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ChevronRight,
  MessageCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Conversation = {
  id: string;
  ride_id: string;
  driver_id: string;
  passenger_id: string;
  created_at: string;
  updated_at: string;
};

type Profile = {
  id: string;
  name: string;
  surname: string;
  avatar_url: string | null;
};

type Ride = {
  id: string;
  event_id: string | null;
  departure_city: string;
  destination: string;
};

type Event = {
  id: string;
  title: string;
  artist: string | null;
};

type Message = {
  conversation_id: string;
  content: string;
  created_at: string;
  sender_id: string;
  read_at: string | null;
};

type ChatItem = {
  id: string;
  otherName: string;
  initials: string;
  avatarUrl: string | null;
  eventLabel: string | null;
  routeLabel: string | null;
  lastMessage: Message | null;
  unreadCount: number;
  lastActivity: string;
};

type Props = {
  currentUserId: string;
};

export default function ChatList({
  currentUserId,
}: Props) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [chats, setChats] =
    useState<ChatItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadChats = useCallback(
    async () => {
      const {
        data: conversationsData,
        error: conversationsError,
      } = await supabase
        .from("conversations")
        .select(`
          id,
          ride_id,
          driver_id,
          passenger_id,
          created_at,
          updated_at
        `)
        .or(
          `driver_id.eq.${currentUserId},passenger_id.eq.${currentUserId}`
        );

      if (conversationsError) {
        console.error(
          "Errore caricamento conversazioni:",
          conversationsError
        );

        setChats([]);
        setLoading(false);
        return;
      }

      const conversations =
        (conversationsData ?? []) as Conversation[];

      if (conversations.length === 0) {
        setChats([]);
        setLoading(false);
        return;
      }

      const conversationIds =
        conversations.map(
          (conversation) =>
            conversation.id
        );

      const profileIds = Array.from(
        new Set(
          conversations.flatMap(
            (conversation) => [
              conversation.driver_id,
              conversation.passenger_id,
            ]
          )
        )
      );

      const rideIds = Array.from(
        new Set(
          conversations.map(
            (conversation) =>
              conversation.ride_id
          )
        )
      );

      const [
        profilesResult,
        ridesResult,
        messagesResult,
        unreadMessagesResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(`
            id,
            name,
            surname,
            avatar_url
          `)
          .in("id", profileIds),

        supabase
          .from("rides")
          .select(`
            id,
            event_id,
            departure_city,
            destination
          `)
          .in("id", rideIds),

        supabase
          .from("messages")
          .select(`
            conversation_id,
            content,
            created_at,
            sender_id,
            read_at
          `)
          .in(
            "conversation_id",
            conversationIds
          )
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("messages")
          .select(`
            conversation_id
          `)
          .in(
            "conversation_id",
            conversationIds
          )
          .neq(
            "sender_id",
            currentUserId
          )
          .is(
            "read_at",
            null
          ),
      ]);

      if (profilesResult.error) {
        console.error(
          "Errore caricamento profili chat:",
          profilesResult.error
        );
      }

      if (ridesResult.error) {
        console.error(
          "Errore caricamento passaggi chat:",
          ridesResult.error
        );
      }

      if (messagesResult.error) {
        console.error(
          "Errore caricamento messaggi chat:",
          messagesResult.error
        );
      }

      if (unreadMessagesResult.error) {
        console.error(
          "Errore caricamento messaggi non letti:",
          unreadMessagesResult.error
        );
      }

      const profiles =
        (profilesResult.data ??
          []) as Profile[];

      const rides =
        (ridesResult.data ??
          []) as Ride[];

      const messages =
        (messagesResult.data ??
          []) as Message[];

      const profileMap = new Map(
        profiles.map((profile) => [
          profile.id,
          profile,
        ])
      );

      const rideMap = new Map(
        rides.map((ride) => [
          ride.id,
          ride,
        ])
      );

      const eventIds = rides
        .map((ride) => ride.event_id)
        .filter(
          (
            eventId
          ): eventId is string =>
            Boolean(eventId)
        );

      const {
        data: eventsData,
        error: eventsError,
      } =
        eventIds.length > 0
          ? await supabase
              .from("events")
              .select(`
                id,
                title,
                artist
              `)
              .in(
                "id",
                eventIds
              )
          : {
              data: [],
              error: null,
            };

      if (eventsError) {
        console.error(
          "Errore caricamento eventi chat:",
          eventsError
        );
      }

      const eventMap = new Map(
        (
          (eventsData ??
            []) as Event[]
        ).map((event) => [
          event.id,
          event,
        ])
      );

      const lastMessageMap =
        new Map<string, Message>();

      for (const message of messages) {
        if (
          !lastMessageMap.has(
            message.conversation_id
          )
        ) {
          lastMessageMap.set(
            message.conversation_id,
            message
          );
        }
      }

      const unreadCountMap =
        new Map<string, number>();

      for (const message of
        unreadMessagesResult.data ??
        []) {
        unreadCountMap.set(
          message.conversation_id,
          (
            unreadCountMap.get(
              message.conversation_id
            ) ?? 0
          ) + 1
        );
      }

      const chatItems =
        conversations
          .map((conversation) => {
            const otherUserId =
              conversation.driver_id ===
              currentUserId
                ? conversation.passenger_id
                : conversation.driver_id;

            const otherProfile =
              profileMap.get(
                otherUserId
              );

            const ride =
              rideMap.get(
                conversation.ride_id
              );

            const event =
              ride?.event_id
                ? eventMap.get(
                    ride.event_id
                  )
                : undefined;

            const lastMessage =
              lastMessageMap.get(
                conversation.id
              ) ?? null;

            const otherName =
              otherProfile
                ? `${otherProfile.name} ${otherProfile.surname}`.trim()
                : "Utente";

            let avatarUrl =
              otherProfile?.avatar_url ??
              null;

            if (
              avatarUrl &&
              !avatarUrl.startsWith(
                "http://"
              ) &&
              !avatarUrl.startsWith(
                "https://"
              )
            ) {
              const {
                data:
                  publicUrlData,
              } =
                supabase.storage
                  .from("avatars")
                  .getPublicUrl(
                    avatarUrl
                  );

              avatarUrl =
                publicUrlData.publicUrl;
            }

            return {
              id: conversation.id,
              otherName,
              initials: otherName
                .split(/\s+/)
                .filter(Boolean)
                .map(
                  (part) =>
                    part.charAt(0)
                )
                .slice(0, 2)
                .join("")
                .toUpperCase(),
              avatarUrl,
              eventLabel: event
                ? `${event.title}${
                    event.artist
                      ? ` · ${event.artist}`
                      : ""
                  }`
                : null,
              routeLabel: ride
                ? `${ride.departure_city} → ${ride.destination}`
                : null,
              lastMessage,
              unreadCount:
                unreadCountMap.get(
                  conversation.id
                ) ?? 0,
              lastActivity:
                lastMessage?.created_at ??
                conversation.updated_at,
            };
          })
          .sort(
            (first, second) =>
              new Date(
                second.lastActivity
              ).getTime() -
              new Date(
                first.lastActivity
              ).getTime()
          );

      setChats(chatItems);
      setLoading(false);
    },
    [
      currentUserId,
      supabase,
    ]
  );

  useEffect(() => {
    void loadChats();

    const channel =
      supabase
        .channel(
          `chat-list:${currentUserId}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
          },
          () => {
            void loadChats();
          }
        )
        .subscribe();

    return () => {
      void supabase.removeChannel(
        channel
      );
    };
  }, [
    currentUserId,
    loadChats,
    supabase,
  ]);

  function formatDate(
    date: string
  ) {
    return new Intl.DateTimeFormat(
      "it-IT",
      {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(date));
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white px-8 py-20 text-center text-slate-500 shadow-sm">
        Caricamento chat...
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white px-8 py-20 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <MessageCircle className="h-8 w-8 text-emerald-600" />
        </div>

        <h2 className="mt-6 text-2xl font-bold text-slate-900">
          Nessuna conversazione
        </h2>

        <p className="mx-auto mt-3 max-w-md text-slate-500">
          Quando una prenotazione verrà
          confermata, la conversazione
          apparirà qui.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {chats.map((chat) => (
        <Link
          key={chat.id}
          href={`/chat/${chat.id}`}
          className="flex items-center gap-5 border-b border-slate-100 p-6 transition last:border-b-0 hover:bg-slate-50"
        >
          {chat.avatarUrl ? (
            <Image
              src={chat.avatarUrl}
              alt={chat.otherName}
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-emerald-50"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-black text-emerald-600">
              {chat.initials || "U"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4">
              <h2 className="truncate text-lg font-bold text-slate-900">
                {chat.otherName}
              </h2>

              <div className="flex items-center gap-3">
                <span className="shrink-0 text-xs text-slate-400">
                  {formatDate(
                    chat.lastActivity
                  )}
                </span>

                {chat.unreadCount > 0 && (
                  <span className="flex min-h-6 min-w-6 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-xs font-bold text-white">
                    {chat.unreadCount > 9
                      ? "9+"
                      : chat.unreadCount}
                  </span>
                )}
              </div>
            </div>

            {chat.eventLabel && (
              <p className="mt-1 truncate text-sm font-medium text-emerald-600">
                {chat.eventLabel}
              </p>
            )}

            {chat.routeLabel && (
              <p className="mt-1 truncate text-sm text-slate-500">
                {chat.routeLabel}
              </p>
            )}

            <p
              className={`mt-2 truncate text-sm ${
                chat.unreadCount > 0
                  ? "font-semibold text-slate-700"
                  : "text-slate-500"
              }`}
            >
              {chat.lastMessage
                ? `${
                    chat.lastMessage
                      .sender_id ===
                    currentUserId
                      ? "Tu: "
                      : ""
                  }${
                    chat.lastMessage
                      .content
                  }`
                : "Nessun messaggio ancora"}
            </p>
          </div>

          <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
        </Link>
      ))}
    </div>
  );
}
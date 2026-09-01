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
  AlertTriangle,
  ChevronRight,
  Loader2,
  MessageCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { isEventConcluded } from "@/lib/utils/eventStatus";

/*
 * Se le query Supabase non risolvono entro questo tempo (visto in
 * produzione: la connessione resta appesa senza errore), smettiamo di
 * mostrare lo spinner e proponiamo un retry invece di lasciare
 * "Caricamento chat..." all'infinito.
 */
const LOAD_TIMEOUT_MS = 15000;

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
  event_date: string;
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

type ChatListDict = {
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  otherUserFallback: string;
  youPrefix: string;
  noMessageYet: string;
  loadErrorTitle: string;
  loadErrorRetry: string;
};

type Props = {
  currentUserId: string;
  dict: ChatListDict;
};

export default function ChatList({
  currentUserId,
  dict,
}: Props) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [chats, setChats] =
    useState<ChatItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState(false);

  const [reloadKey, setReloadKey] =
    useState(0);

  const loadChats = useCallback(
    async () => {
    try {
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

        setLoadError(true);
        setChats([]);
        setLoading(false);
        return;
      }

      const conversations =
        (conversationsData ?? []) as Conversation[];

      if (conversations.length === 0) {
        setLoadError(false);
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
                artist,
                event_date
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
          .filter((conversation) => {
            const ride = rideMap.get(
              conversation.ride_id
            );

            const event =
              ride?.event_id
                ? eventMap.get(
                    ride.event_id
                  )
                : undefined;

            return !(
              event &&
              isEventConcluded(
                event.event_date
              )
            );
          })
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
                : dict.otherUserFallback;

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

      setLoadError(false);
      setChats(chatItems);
      setLoading(false);
    } catch (error) {
      console.error(
        "Errore imprevisto caricamento chat:",
        error
      );

      setLoadError(true);
      setLoading(false);
    }
    },
    [
      currentUserId,
      supabase,
      dict.otherUserFallback,
    ]
  );

  useEffect(() => {
    // Caricamento chat al mount / al retry: sync legittima con dati
    // remoti, non derivazione di stato da altro stato/props.
    let active = true;

    // Reset dello stato di caricamento prima di ogni (ri)fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setLoadError(false);

    // Watchdog: se le query non risolvono (né dati né errore) entro il
    // tempo massimo, sblocchiamo comunque la UI con un retry.
    const watchdog = window.setTimeout(() => {
      if (active) {
        setLoadError(true);
        setLoading(false);
      }
    }, LOAD_TIMEOUT_MS);

    void loadChats().finally(() => {
      window.clearTimeout(watchdog);
    });

    return () => {
      active = false;
      window.clearTimeout(watchdog);
    };
  }, [reloadKey, loadChats]);

  useEffect(() => {
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
      <Card className="flex flex-col items-center justify-center gap-3 px-8 py-20 text-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>{dict.loading}</span>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="flex flex-col items-center justify-center gap-4 px-8 py-20 text-center">
        <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        <span className="text-muted-foreground">
          {dict.loadErrorTitle}
        </span>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setReloadKey((key) => key + 1)
          }
        >
          {dict.loadErrorRetry}
        </Button>
      </Card>
    );
  }

  if (chats.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title={dict.emptyTitle}
        description={dict.emptyDescription}
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      {chats.map((chat) => (
        <Link
          key={chat.id}
          href={`/chat/${chat.id}`}
          className="flex items-center gap-5 border-b border-border p-6 transition last:border-b-0 hover:bg-muted"
        >
          {chat.avatarUrl ? (
            <Image
              src={chat.avatarUrl}
              alt={chat.otherName}
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-accent"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-black text-accent-foreground">
              {chat.initials || "U"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4">
              <h2 className="truncate text-lg font-semibold text-foreground">
                {chat.otherName}
              </h2>

              <div className="flex items-center gap-3">
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(
                    chat.lastActivity
                  )}
                </span>

                {chat.unreadCount > 0 && (
                  <span className="flex min-h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                    {chat.unreadCount > 9
                      ? "9+"
                      : chat.unreadCount}
                  </span>
                )}
              </div>
            </div>

            {chat.eventLabel && (
              <p className="mt-1 truncate text-sm font-medium text-primary">
                {chat.eventLabel}
              </p>
            )}

            {chat.routeLabel && (
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {chat.routeLabel}
              </p>
            )}

            <p
              className={`mt-2 truncate text-sm ${
                chat.unreadCount > 0
                  ? "font-semibold text-foreground/90"
                  : "text-muted-foreground"
              }`}
            >
              {chat.lastMessage
                ? `${
                    chat.lastMessage
                      .sender_id ===
                    currentUserId
                      ? dict.youPrefix
                      : ""
                  }${
                    chat.lastMessage
                      .content
                  }`
                : dict.noMessageYet}
            </p>
          </div>

          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/60" />
        </Link>
      ))}
    </Card>
  );
}
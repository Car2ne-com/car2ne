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
  Loader2,
  MessageCircle,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

type Conversation = {
  id: string;
  ride_id: string;
  driver_id: string;
  passenger_id: string;
  updated_at: string;
};

type Profile = {
  id: string;
  name: string | null;
  surname: string | null;
  avatar_url: string | null;
};

type Message = {
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

type ChatItem = {
  id: string;
  otherName: string;
  initials: string;
  avatarUrl: string | null;
  lastMessage: Message | null;
  unreadCount: number;
  lastActivity: string;
};

export default function FloatingChat() {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState<string | null>(
    null
  );

  const [chats, setChats] =
    useState<ChatItem[]>([]);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  /*
   * ==============================
   * SUONO NUOVO MESSAGGIO
   * ==============================
   */

  const playMessageSound = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      const audioContext =
        new AudioContextClass();

      const play = () => {
        const oscillator =
          audioContext.createOscillator();

        const gain =
          audioContext.createGain();

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
          880,
          audioContext.currentTime
        );

        oscillator.frequency.exponentialRampToValueAtTime(
          660,
          audioContext.currentTime + 0.12
        );

        gain.gain.setValueAtTime(
          0.0001,
          audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
          0.12,
          audioContext.currentTime + 0.01
        );

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          audioContext.currentTime + 0.16
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(
          audioContext.currentTime + 0.16
        );

        oscillator.addEventListener(
          "ended",
          () => {
            void audioContext.close();
          },
          { once: true }
        );
      };

      if (
        audioContext.state ===
        "suspended"
      ) {
        void audioContext
          .resume()
          .then(play)
          .catch(() => {
            void audioContext.close();
          });
      } else {
        play();
      }
    } catch (error) {
      console.error(
        "Errore riproduzione suono messaggio:",
        error
      );
    }
  }, []);

  const loadChats = useCallback(
    async () => {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        setCurrentUserId(null);
        setChats([]);
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      /*
       * ==============================
       * CONVERSAZIONI
       * ==============================
       */

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
          updated_at
        `)
        .or(
          `driver_id.eq.${user.id},passenger_id.eq.${user.id}`
        );

      if (conversationsError) {
        console.error(
          "Errore caricamento chat flottante:",
          conversationsError
        );

        setChats([]);
        setLoading(false);
        return;
      }

      const conversations =
        (conversationsData ??
          []) as Conversation[];

      if (
        conversations.length === 0
      ) {
        setChats([]);
        setLoading(false);
        return;
      }

      const conversationIds =
        conversations.map(
          (conversation) =>
            conversation.id
        );

      const profileIds =
        Array.from(
          new Set(
            conversations.flatMap(
              (conversation) => [
                conversation.driver_id,
                conversation.passenger_id,
              ]
            )
          )
        );

      /*
       * ==============================
       * PROFILI + MESSAGGI
       * ==============================
       */

      const [
        profilesResult,
        messagesResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(`
            id,
            name,
            surname,
            avatar_url
          `)
          .in(
            "id",
            profileIds
          ),

        supabase
          .from("messages")
          .select(`
            conversation_id,
            sender_id,
            content,
            created_at,
            read_at
          `)
          .in(
            "conversation_id",
            conversationIds
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          ),
      ]);

      if (profilesResult.error) {
        console.error(
          "Errore caricamento profili chat flottante:",
          profilesResult.error
        );
      }

      if (messagesResult.error) {
        console.error(
          "Errore caricamento messaggi chat flottante:",
          messagesResult.error
        );
      }

      const profiles =
        (profilesResult.data ??
          []) as Profile[];

      const messages =
        (messagesResult.data ??
          []) as Message[];

      /*
       * ==============================
       * MAPPA PROFILI
       * ==============================
       */

      const profileMap =
        new Map<string, Profile>();

      for (const profile of profiles) {
        profileMap.set(
          profile.id,
          profile
        );
      }

      /*
       * ==============================
       * ULTIMO MESSAGGIO
       * ==============================
       */

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

      /*
       * ==============================
       * NON LETTI
       * ==============================
       */

      const unreadCountMap =
        new Map<string, number>();

      for (const message of messages) {
        if (
          message.sender_id !==
            user.id &&
          !message.read_at
        ) {
          unreadCountMap.set(
            message.conversation_id,
            (
              unreadCountMap.get(
                message.conversation_id
              ) ?? 0
            ) + 1
          );
        }
      }

      /*
       * ==============================
       * COSTRUZIONE CHAT
       * ==============================
       */

      const chatItems =
        conversations
          .map((conversation) => {
            const otherUserId =
              conversation.driver_id ===
              user.id
                ? conversation.passenger_id
                : conversation.driver_id;

            const profile =
              profileMap.get(
                otherUserId
              );

            const otherName =
              `${profile?.name ?? ""} ${
                profile?.surname ?? ""
              }`.trim() || "Utente";

            const initials =
              otherName
                .split(/\s+/)
                .filter(Boolean)
                .map(
                  (part) =>
                    part.charAt(0)
                )
                .slice(0, 2)
                .join("")
                .toUpperCase() ||
              "U";

            let avatarUrl =
              profile?.avatar_url ??
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

            const lastMessage =
              lastMessageMap.get(
                conversation.id
              ) ?? null;

            const unreadCount =
              unreadCountMap.get(
                conversation.id
              ) ?? 0;

            return {
              id: conversation.id,
              otherName,
              initials,
              avatarUrl,
              lastMessage,
              unreadCount,
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
    [supabase]
  );

  /*
   * ==============================
   * CONTROLLO SESSIONE INIZIALE
   * ==============================
   *
   * Gira sempre, anche per utenti anonimi: è un singolo check,
   * serve solo a sapere se mostrare il pulsante. Rimandata a
   * quando il thread principale è libero (o dopo un breve
   * timeout) per non competere con l'idratazione/rendering
   * iniziale della pagina, specialmente su mobile.
   */

  useEffect(() => {
    const win = window as typeof window & {
      requestIdleCallback?: (
        callback: () => void
      ) => number;
      cancelIdleCallback?: (
        handle: number
      ) => void;
    };

    if (win.requestIdleCallback) {
      const handle = win.requestIdleCallback(
        () => void loadChats()
      );

      return () => {
        win.cancelIdleCallback?.(handle);
      };
    }

    const timeoutId = window.setTimeout(
      () => void loadChats(),
      200
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadChats]);

  /*
   * ==============================
   * REALTIME
   * ==============================
   *
   * Attivo SOLO per utenti autenticati. Prima girava
   * incondizionatamente per chiunque visitasse il sito: un
   * visitatore anonimo apriva comunque una connessione realtime
   * e faceva un giro di rete ogni 30s all'infinito, per
   * un pulsante che per lui non verrà mai mostrato.
   */

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const channel =
      supabase
        .channel(
          "floating-chat-realtime"
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            const newMessage =
              payload.new as Message;

            /*
             * Il suono viene riprodotto
             * SOLO per messaggi ricevuti.
             */
            if (
              newMessage.sender_id !==
              currentUserId
            ) {
              playMessageSound();
            }

            setChats((current) => {
              const existing =
                current.find(
                  (chat) =>
                    chat.id ===
                    newMessage.conversation_id
                );

              if (!existing) {
                void loadChats();
                return current;
              }

              const isMine =
                newMessage.sender_id ===
                currentUserId;

              const updatedChat: ChatItem =
                {
                  ...existing,
                  lastMessage:
                    newMessage,
                  lastActivity:
                    newMessage.created_at,
                  unreadCount:
                    isMine
                      ? existing.unreadCount
                      : existing.unreadCount +
                        1,
                };

              return [
                updatedChat,
                ...current.filter(
                  (chat) =>
                    chat.id !==
                    newMessage.conversation_id
                ),
              ];
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            const updatedMessage =
              payload.new as Message;

            setChats((current) =>
              current.map((chat) => {
                if (
                  chat.id !==
                  updatedMessage.conversation_id
                ) {
                  return chat;
                }

                const previousMessage =
                  chat.lastMessage;

                const unreadWasPresent =
                  previousMessage &&
                  previousMessage.sender_id !==
                    currentUserId &&
                  !previousMessage.read_at;

                const unreadIsPresent =
                  updatedMessage.sender_id !==
                    currentUserId &&
                  !updatedMessage.read_at;

                let unreadCount =
                  chat.unreadCount;

                if (
                  unreadWasPresent &&
                  !unreadIsPresent
                ) {
                  unreadCount =
                    Math.max(
                      0,
                      unreadCount - 1
                    );
                }

                return {
                  ...chat,
                  lastMessage:
                    updatedMessage,
                  unreadCount,
                  lastActivity:
                    updatedMessage.created_at,
                };
              })
            );
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "conversations",
          },
          () => {
            void loadChats();
          }
        )
        .subscribe();

    /*
     * Solo un fallback di sicurezza (es. un evento realtime perso
     * per un hiccup del websocket) — l'aggiornamento vero arriva
     * dai listener sopra. Un giro completo di query ogni 30s per
     * ogni utente loggato su ogni pagina era lavoro ridondante e
     * costante in background: rallenta soprattutto su mobile
     * (rete/batteria) senza portare reattività percepita in più,
     * dato che il realtime copre già il caso normale.
     */
    const interval =
      window.setInterval(
        () => {
          void loadChats();
        },
        180000
      );

    return () => {
      window.clearInterval(
        interval
      );

      void supabase.removeChannel(
        channel
      );
    };
  }, [
    loadChats,
    supabase,
    currentUserId,
    playMessageSound,
  ]);

  /*
   * ==============================
   * ESC
   * ==============================
   */

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /*
   * ==============================
   * NON LETTI TOTALI
   * ==============================
   */

  const unreadTotal =
    chats.reduce(
      (total, chat) =>
        total + chat.unreadCount,
      0
    );

  /*
   * ==============================
   * DATA
   * ==============================
   */

  function formatDate(
    date: string
  ) {
    const messageDate =
      new Date(date);

    const now = new Date();

    if (
      messageDate.toDateString() ===
      now.toDateString()
    ) {
      return messageDate.toLocaleTimeString(
        "it-IT",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    }

    return new Intl.DateTimeFormat(
      "it-IT",
      {
        day: "2-digit",
        month: "2-digit",
      }
    ).format(messageDate);
  }

  /*
   * ==============================
   * UTENTE NON AUTENTICATO
   * ==============================
   */

  if (!currentUserId) {
    return null;
  }

  /*
   * ==============================
   * RENDER
   * ==============================
   */

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {open && (
        <div className="absolute bottom-16 right-0 mb-3 w-[380px] max-w-[calc(100vw-32px)] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 bg-card px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                <MessageCircle className="h-5 w-5 text-accent-foreground" />
              </div>

              <div>
                <h2 className="font-bold text-foreground">
                  Chat
                </h2>

                <p className="text-xs text-muted-foreground">
                  Le tue conversazioni
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                setOpen(false)
              }
              className="h-9 w-9 rounded-full text-slate-400 hover:text-slate-700"
              aria-label="Chiudi chat"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-5 py-12 text-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Caricamento chat...</span>
              </div>
            ) : chats.length ===
              0 ? (
              <EmptyState
                icon={MessageCircle}
                title="Nessuna conversazione"
                description="Le tue chat appariranno qui."
                className="rounded-none border-none bg-transparent px-5 py-12 shadow-none"
              />
            ) : (
              chats.map((chat) => {
                const hasUnread =
                  chat.unreadCount >
                  0;

                return (
                  <Link
                    key={chat.id}
                    href={`/chat/${chat.id}`}
                    onClick={() => {
                      setChats(
                        (current) =>
                          current.map(
                            (item) =>
                              item.id ===
                              chat.id
                                ? {
                                    ...item,
                                    unreadCount: 0,
                                    lastMessage:
                                      item.lastMessage
                                        ? {
                                            ...item.lastMessage,
                                            read_at:
                                              new Date().toISOString(),
                                          }
                                        : null,
                                  }
                                : item
                          )
                      );

                      setOpen(false);

                      void supabase.rpc(
                        "mark_conversation_messages_read",
                        {
                          p_conversation_id:
                            chat.id,
                        }
                      );
                    }}
                    className={`flex items-center gap-3 border-b border-slate-100 px-5 py-4 transition last:border-b-0 ${
                      hasUnread
                        ? "bg-accent/50 hover:bg-accent"
                        : "hover:bg-muted"
                    }`}
                  >
                    {chat.avatarUrl ? (
                      <Image
                        src={
                          chat.avatarUrl
                        }
                        alt={
                          chat.otherName
                        }
                        width={48}
                        height={48}
                        className={`h-12 w-12 shrink-0 rounded-full object-cover ${
                          hasUnread
                            ? "ring-2 ring-emerald-300"
                            : "ring-2 ring-accent"
                        }`}
                      />
                    ) : (
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold ${
                          hasUnread
                            ? "bg-emerald-200 text-emerald-700"
                            : "bg-accent text-accent-foreground"
                        }`}
                      >
                        {
                          chat.initials
                        }
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-sm ${
                            hasUnread
                              ? "font-black text-foreground"
                              : "font-bold text-slate-800"
                          }`}
                        >
                          {
                            chat.otherName
                          }
                        </p>

                        <span
                          className={`shrink-0 text-[10px] ${
                            hasUnread
                              ? "font-semibold text-primary"
                              : "text-slate-400"
                          }`}
                        >
                          {formatDate(
                            chat.lastActivity
                          )}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <p
                          className={`min-w-0 flex-1 truncate text-xs ${
                            hasUnread
                              ? "font-semibold text-slate-700"
                              : "text-muted-foreground"
                          }`}
                        >
                          {chat.lastMessage ? (
                            <>
                              {chat
                                .lastMessage
                                .sender_id ===
                                currentUserId && (
                                <span className="font-semibold">
                                  Tu:{" "}
                                </span>
                              )}

                              {
                                chat
                                  .lastMessage
                                  .content
                              }
                            </>
                          ) : (
                            "Nessun messaggio ancora"
                          )}
                        </p>

                        {hasUnread && (
                          <span className="flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                            {chat.unreadCount >
                            9
                              ? "9+"
                              : chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </Link>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-100 bg-muted px-5 py-3 text-center">
            <Link
              href="/chat"
              onClick={() =>
                setOpen(false)
              }
              className="text-sm font-semibold text-primary transition hover:text-primary/80"
            >
              Vedi tutte le chat →
            </Link>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() =>
          setOpen(
            (current) => !current
          )
        }
        size="icon"
        className="relative h-14 w-14 rounded-full shadow-xl shadow-primary/25 hover:scale-105 active:scale-95"
        aria-label={
          open
            ? "Chiudi chat"
            : "Apri chat"
        }
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}

        {!open &&
          unreadTotal > 0 && (
            <span className="absolute -right-1 -top-1 flex min-h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground shadow-md ring-2 ring-background">
              {unreadTotal > 9
                ? "9+"
                : unreadTotal}
            </span>
          )}
      </Button>
    </div>
  );
}
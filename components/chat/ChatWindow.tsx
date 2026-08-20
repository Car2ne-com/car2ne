"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Image from "next/image";

import {
  Check,
  CheckCheck,
  LockKeyhole,
  MessageCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  delivered_at: string | null;
  read_at: string | null;
};

type Ride = {
  id: string;
  event_id: string | null;
  departure_city: string;
  destination: string;
  departure_date: string;
  departure_time: string;
  status: string;
} | null;

type Event = {
  id: string;
  title: string;
  artist: string | null;
  venue: string | null;
  city: string | null;
  event_date: string;
} | null;

type ChatWindowDict = {
  subtitle: string;
  statusRead: string;
  statusDelivered: string;
  statusSent: string;
  emptyTitle: string;
  emptyDescription: string;
  inputPlaceholder: string;
  sendAriaLabel: string;
  inputHint: string;
  closedTitle: string;
  closedDefaultReason: string;
  sendError: string;
};

type Props = {
  conversationId: string;
  currentUserId: string;
  otherUserId: string;
  otherName: string;
  avatarUrl: string | null;
  ride: Ride;
  event: Event;
  initialMessages: Message[];
  canSendMessages?: boolean;
  chatClosedReason?: string | null;
  dict: ChatWindowDict;
};

export default function ChatWindow({
  conversationId,
  currentUserId,
  otherUserId,
  otherName,
  avatarUrl,
  ride,
  event,
  initialMessages,
  canSendMessages = true,
  chatClosedReason = null,
  dict,
}: Props) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const safeInitialMessages =
    Array.isArray(initialMessages)
      ? initialMessages
      : [];

  const [messages, setMessages] =
    useState<Message[]>(safeInitialMessages);

  const [content, setContent] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const messagesRef =
    useRef<Message[]>(safeInitialMessages);

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current = messages;

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  useEffect(() => {
    async function markConversationAsRead() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error(
          "Errore recupero utente Supabase:",
          authError
        );

        return;
      }

      if (!user) {
        console.warn(
          "Sessione Supabase non disponibile."
        );

        return;
      }

      const { error } =
        await supabase.rpc(
          "mark_conversation_messages_read",
          {
            p_conversation_id:
              conversationId,
          }
        );

      if (error) {
        console.error(
          "Errore marcatura messaggi come letti:",
          error
        );

        return;
      }

      setMessages((current) =>
        current.map((message) => {
          if (
            message.sender_id !== user.id &&
            !message.read_at
          ) {
            return {
              ...message,
              read_at:
                new Date().toISOString(),
            };
          }

          return message;
        })
      );
    }

    async function markMessagesAsDelivered(
      messageIds: string[]
    ) {
      if (messageIds.length === 0) {
        return;
      }

      await Promise.all(
        messageIds.map(
          async (messageId) => {
            const { error } =
              await supabase.rpc(
                "mark_message_delivered",
                {
                  p_message_id: messageId,
                }
              );

            if (error) {
              console.error(
                "Errore conferma consegna messaggio:",
                error
              );
            }
          }
        )
      );
    }

    const channel = supabase
      .channel(
        `conversation:${conversationId}`
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter:
            `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage =
            payload.new as Message;

          setMessages((current) => {
            if (
              current.some(
                (message) =>
                  message.id ===
                  newMessage.id
              )
            ) {
              return current;
            }

            return [
              ...current,
              newMessage,
            ];
          });

          if (
            newMessage.sender_id ===
            otherUserId
          ) {
            await markMessagesAsDelivered([
              newMessage.id,
            ]);

            await markConversationAsRead();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter:
            `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage =
            payload.new as Message;

          setMessages((current) =>
            current.map((message) =>
              message.id ===
              updatedMessage.id
                ? {
                    ...message,
                    delivered_at:
                      updatedMessage.delivered_at,
                    read_at:
                      updatedMessage.read_at,
                  }
                : message
            )
          );
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          return;
        }

        const incomingMessages =
          messagesRef.current.filter(
            (message) =>
              message.sender_id ===
                otherUserId &&
              !message.delivered_at
          );

        void markMessagesAsDelivered(
          incomingMessages.map(
            (message) => message.id
          )
        );

        void markConversationAsRead();
      });

    return () => {
      void supabase.removeChannel(
        channel
      );
    };
  }, [
    conversationId,
    otherUserId,
    supabase,
  ]);

  const initials =
    (otherName ?? "")
      .split(" ")
      .filter(Boolean)
      .map((part) =>
        part.charAt(0)
      )
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  async function handleSend(
    formEvent: FormEvent<HTMLFormElement>
  ) {
    formEvent.preventDefault();

    const text = content.trim();

    if (
      !text ||
      loading ||
      !canSendMessages
    ) {
      return;
    }

    setLoading(true);

    const { data, error } =
      await supabase
        .from("messages")
        .insert({
          conversation_id:
            conversationId,
          sender_id: currentUserId,
          content: text,
        })
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          created_at,
          delivered_at,
          read_at
        `)
        .single();

    setLoading(false);

    if (error) {
      console.error(
        "Errore invio messaggio:",
        error
      );

      toast.error(
        dict.sendError
      );

      return;
    }

    if (data) {
      setMessages((current) => {
        if (
          current.some(
            (message) =>
              message.id === data.id
          )
        ) {
          return current;
        }

        return [
          ...current,
          data as Message,
        ];
      });
    }

    setContent("");
  }

  function formatTime(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleTimeString(
      "it-IT",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function MessageStatus({
    message,
  }: {
    message: Message;
  }) {
    if (message.read_at) {
      return (
        <CheckCheck
          className="h-4 w-4 text-sky-200"
          aria-label={dict.statusRead}
        />
      );
    }

    if (message.delivered_at) {
      return (
        <CheckCheck
          className="h-4 w-4 text-primary-foreground/80"
          aria-label={dict.statusDelivered}
        />
      );
    }

    return (
      <Check
        className="h-4 w-4 text-primary-foreground/80"
        aria-label={dict.statusSent}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">

      {/* HEADER */}

      <div className="border-b border-border p-6">
        <div className="flex items-center gap-4">

          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={otherName}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-accent"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-lg font-black text-accent-foreground">
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-foreground">
              {otherName}
            </h1>

            <p className="text-sm text-muted-foreground">
              {dict.subtitle}
            </p>
          </div>

        </div>

        {ride && (
          <div className="mt-5 rounded-2xl bg-muted p-4">

            {event && (
              <p className="font-bold text-foreground">
                {event.title}
                {event.artist
                  ? ` · ${event.artist}`
                  : ""}
              </p>
            )}

            <p className="mt-1 text-sm text-muted-foreground">
              {ride.departure_city}
              {" → "}
              {ride.destination}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {ride.departure_date}
              {" · "}
              {ride.departure_time.slice(
                0,
                5
              )}
            </p>

          </div>
        )}

      </div>

      {/* MESSAGGI */}

      <div className="min-h-[420px] space-y-4 bg-muted p-6">

        {messages.length === 0 ? (

          <div className="flex min-h-[380px] items-center justify-center">
            <EmptyState
              icon={MessageCircle}
              title={dict.emptyTitle}
              description={dict.emptyDescription}
              className="border-none bg-transparent shadow-none"
            />
          </div>

        ) : (

          messages.map((message) => {

            const isMine =
              message.sender_id ===
              currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isMine
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    isMine
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-card text-foreground/90 shadow-sm"
                  }`}
                >

                  <p className="whitespace-pre-wrap break-words text-sm">
                    {message.content}
                  </p>

                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                      isMine
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >

                    <span>
                      {formatTime(
                        message.created_at
                      )}
                    </span>

                    {isMine && (
                      <MessageStatus
                        message={
                          message
                        }
                      />
                    )}

                  </div>

                </div>

              </div>
            );
          })

        )}

        <div ref={messagesEndRef} />

      </div>

      {/* INPUT */}

      {canSendMessages ? (

        <form
          onSubmit={handleSend}
          className="border-t border-border bg-card p-4"
        >

          <div className="flex items-end gap-3">

            <textarea
              value={content}
              onChange={(event) =>
                setContent(
                  event.target.value
                )
              }
              disabled={loading}
              rows={1}
              maxLength={1000}
              placeholder={dict.inputPlaceholder}
              className="min-h-12 flex-1 resize-none rounded-2xl border border-border px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted"
              onKeyDown={(event) => {

                if (
                  event.key ===
                    "Enter" &&
                  !event.shiftKey
                ) {

                  event.preventDefault();

                  event.currentTarget.form?.requestSubmit();
                }

              }}
            />

            <Button
              type="submit"
              disabled={
                loading ||
                !content.trim()
              }
              size="icon"
              className="h-12 w-12 shrink-0 rounded-2xl"
              aria-label={dict.sendAriaLabel}
            >
              <Send className="h-5 w-5" />
            </Button>

          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {dict.inputHint}
          </p>

        </form>

      ) : (

        <div className="border-t border-border bg-muted p-5">

          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <LockKeyhole className="h-5 w-5 text-muted-foreground" />
            </div>

            <div>

              <p className="font-semibold text-foreground">
                {dict.closedTitle}
              </p>

              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {chatClosedReason ??
                  dict.closedDefaultReason}
              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
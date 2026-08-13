"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Check,
  CheckCheck,
  LockKeyhole,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

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
        "Non è stato possibile inviare il messaggio."
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
          aria-label="Letto"
        />
      );
    }

    if (message.delivered_at) {
      return (
        <CheckCheck
          className="h-4 w-4 text-emerald-100"
          aria-label="Consegnato"
        />
      );
    }

    return (
      <Check
        className="h-4 w-4 text-emerald-100"
        aria-label="Inviato"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* HEADER */}

      <div className="border-b border-slate-100 p-6">
        <div className="flex items-center gap-4">

          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={otherName}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-50"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-lg font-black text-emerald-600">
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-slate-900">
              {otherName}
            </h1>

            <p className="text-sm text-slate-500">
              Conversazione Car2ne
            </p>
          </div>

        </div>

        {ride && (
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">

            {event && (
              <p className="font-bold text-slate-900">
                {event.title}
                {event.artist
                  ? ` · ${event.artist}`
                  : ""}
              </p>
            )}

            <p className="mt-1 text-sm text-slate-500">
              {ride.departure_city}
              {" → "}
              {ride.destination}
            </p>

            <p className="mt-1 text-xs text-slate-400">
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

      <div className="min-h-[420px] space-y-4 bg-slate-50 p-6">

        {messages.length === 0 ? (

          <div className="flex min-h-[380px] items-center justify-center text-center">

            <div>

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                💬
              </div>

              <p className="mt-4 font-semibold text-slate-700">
                Nessun messaggio ancora
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Inizia la conversazione.
              </p>

            </div>

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
                      ? "rounded-br-md bg-emerald-500 text-white"
                      : "rounded-bl-md bg-white text-slate-700 shadow-sm"
                  }`}
                >

                  <p className="whitespace-pre-wrap break-words text-sm">
                    {message.content}
                  </p>

                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                      isMine
                        ? "text-emerald-100"
                        : "text-slate-400"
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
          className="border-t border-slate-100 bg-white p-4"
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
              placeholder="Scrivi un messaggio..."
              className="min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
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

            <button
              type="submit"
              disabled={
                loading ||
                !content.trim()
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Invia messaggio"
            >
              <Send className="h-5 w-5" />
            </button>

          </div>

          <p className="mt-2 text-xs text-slate-400">
            Invio con Enter · Shift + Enter per andare a capo
          </p>

        </form>

      ) : (

        <div className="border-t border-slate-100 bg-slate-50 p-5">

          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <LockKeyhole className="h-5 w-5 text-slate-500" />
            </div>

            <div>

              <p className="font-semibold text-slate-800">
                Conversazione chiusa
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                {chatClosedReason ??
                  "Non è più possibile inviare nuovi messaggi in questa conversazione."}
              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
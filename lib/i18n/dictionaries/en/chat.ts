import type { it } from "../it";

export const chat: (typeof it)["chat"] = {
  page: {
    title: "Chat",
    subtitle: "Your conversations with other Car2ne users.",
  },
  conversationPage: {
    backLink: "Back to chats",
    otherUserFallback: "User",
    bookingInactiveReason: "The booking is no longer active.",
    blockedReason: "You can no longer exchange messages in this conversation.",
  },
  list: {
    loading: "Loading chats...",
    emptyTitle: "No conversations yet",
    emptyDescription:
      "Once a booking is confirmed, the conversation will appear here.",
    otherUserFallback: "User",
    youPrefix: "You: ",
    noMessageYet: "No messages yet",
  },
  window: {
    subtitle: "Car2ne conversation",
    statusRead: "Read",
    statusDelivered: "Delivered",
    statusSent: "Sent",
    emptyTitle: "No messages yet",
    emptyDescription: "Start the conversation.",
    inputPlaceholder: "Write a message...",
    sendAriaLabel: "Send message",
    inputHint: "Send with Enter · Shift + Enter for a new line",
    closedTitle: "Conversation closed",
    closedDefaultReason:
      "You can no longer send new messages in this conversation.",
    sendError: "The message could not be sent.",
  },
  floating: {
    title: "Chat",
    subtitle: "Your conversations",
    closeAriaLabel: "Close chat",
    openAriaLabel: "Open chat",
    loading: "Loading chats...",
    emptyTitle: "No conversations yet",
    emptyDescription: "Your chats will appear here.",
    otherUserFallback: "User",
    youPrefix: "You: ",
    noMessageYet: "No messages yet",
    viewAllLink: "See all chats →",
  },
};

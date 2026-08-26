import type { it } from "../it";

export const dashboardWatchlist: (typeof it)["dashboardWatchlist"] = {
  listPage: {
    badge: "🔔 Followed events",
    title: "My followed events",
    subtitle:
      "We'll notify you as soon as someone posts a ride for these events.",
    emptyTitle: "You're not following any event",
    emptyDescription:
      "Follow an event that doesn't have any rides yet to get notified as soon as someone offers one.",
    emptyCta: "Browse events",
    viewEvent: "View event",
    stopNotifying: "Stop notifying me",
  },
};

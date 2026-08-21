import type { it } from "../it";

export const eventSuggestions: (typeof it)["eventSuggestions"] = {
  page: {
    title: "Suggest an event",
    intro:
      "Can't find the event you're looking for a ride to? If it's sold on TicketOne, Vivaticket or another circuit we don't import automatically, let us know: if approved, it becomes a real event on Car2ne.",
  },
  guestNotice: {
    title: "Account required",
    description: "Log in to suggest a missing event.",
    cta: "Log in",
  },
  form: {
    titleLabel: "Event title *",
    artistLabel: "Artist *",
    venueLabel: "Venue *",
    cityLabel: "City *",
    eventDateLabel: "Event date *",
    externalUrlLabel: "Ticket link (optional)",
    externalUrlHint: "The event page URL on TicketOne, Vivaticket, etc.",
    imageUrlLabel: "Image link (optional)",
    imageUrlHint:
      "Right-click the image on the event page → \"copy image address\" → paste it here.",
    descriptionLabel: "Notes (optional)",
    submit: "Send suggestion",
    submitting: "Sending...",
  },
  toasts: {
    missingFields: "Fill in all the required fields.",
    submitFailed: "Couldn't send the suggestion.",
    submitSuccess: "Suggestion sent. Thank you!",
  },
  success: {
    title: "Suggestion sent",
    description:
      "Thank you! Our team will review it: if approved, the event will show up in Car2ne's catalog.",
    another: "Suggest another event",
  },
};

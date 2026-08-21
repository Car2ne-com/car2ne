import type { it } from "../it";

export const eventSuggestions: (typeof it)["eventSuggestions"] = {
  page: {
    title: "Suggest an event",
    intro:
      "Can't find the event you're looking for a ride to? Paste the event page link: if approved, it becomes a real event on Car2ne.",
  },
  guestNotice: {
    title: "Account required",
    description: "Log in to suggest a missing event.",
    cta: "Log in",
  },
  form: {
    urlLabel: "Event link *",
    urlPlaceholder: "https://...",
    submit: "Send suggestion",
    submitting: "Sending...",
  },
  toasts: {
    missingFields: "Paste the event link.",
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

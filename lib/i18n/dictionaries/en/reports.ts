import type { it } from "../it";

export const reports: (typeof it)["reports"] = {
  page: {
    title: "Report a problem",
    intro:
      "If you've encountered a technical issue, improper behavior from another user, inappropriate content in chat or in a review, or any other difficulty with Car2ne, report it and we'll get back to you as soon as possible.",
  },
  guestNotice: {
    title: "What helps us respond faster",
    tips: [
      "A clear description of the problem",
      "If it concerns a specific ride or user: the event, the date and, if possible, the name of the other user involved",
      "Any relevant screenshots",
    ],
    cta: "Email report@car2ne.com",
  },
  form: {
    categoryLabel: "Category *",
    categories: {
      user_behavior: "User behavior",
      inappropriate_content: "Inappropriate content",
      technical_issue: "Technical issue",
      safety: "Safety",
      no_show: "No-show",
      other: "Other",
    },
    targetUserBanner: "You're reporting: {name}",
    rideLabel: "Does this concern a specific ride? (optional)",
    rideNone: "None / general report",
    descriptionLabel: "Description *",
    descriptionPlaceholder: "Describe what happened...",
    submit: "Send report",
    submitting: "Sending...",
  },
  toasts: {
    missingCategory: "Select a category.",
    missingDescription: "Describe the problem.",
    submitFailed: "Couldn't send the report.",
    submitSuccess: "Report sent. We'll get back to you as soon as possible.",
  },
  success: {
    title: "Report sent",
    description:
      "Thanks for the report. Our team will review it and update you via notifications.",
    another: "Send another report",
  },
  noShow: {
    button: "Report no-show",
    reported: "No-show reported",
    dialogTitle: "Report no-show",
    dialogDescription:
      "Do you confirm the other person didn't show up? Our team will review the report.",
    noteLabel: "Note (optional)",
    confirm: "Report",
    cancel: "Cancel",
    submitting: "Sending...",
    toastSuccess: "Report sent. Thanks for letting us know.",
    toastFailed: "Couldn't send the report.",
  },
};

import type { it } from "../it";

export const layout: (typeof it)["layout"] = {
  nav: {
    home: "Home",
    events: "Events",
    offerRide: "Offer a ride",
  },
  mobileMenu: {
    open: "Open menu",
    close: "Close menu",
  },
  auth: {
    login: "Log in",
    register: "Sign up",
  },
  userMenu: {
    welcomeBack: "Welcome back",
    accountLabel: "Car2ne account",
    dashboard: "Dashboard",
    myChats: "My chats",
    myRides: "My rides",
    myBookings: "My bookings",
    myWatchlist: "Followed events",
    myProfile: "My profile",
    betaChecklist: "Beta checklist",
    admin: "Admin",
    logout: "Log out",
  },
  notifications: {
    ariaLabel: "Notifications",
    title: "Notifications",
    unreadItemsSuffix: "unread items",
    markAllRead: "Mark notifications as read",
    messagesTitle: "Messages",
    unreadMessageSingular: "You have {count} unread message.",
    unreadMessagePlural: "You have {count} unread messages.",
    openChats: "Open chats →",
    loading: "Loading notifications...",
    emptyTitle: "No notifications",
    emptyDescription: "You'll see requests and updates about your rides here.",
    viewAll: "View all notifications →",
  },
  footer: {
    description:
      "Car2ne connects people heading to the same event, so they can travel together and split the cost.",
    productHeading: "Product",
    accountHeading: "Account",
    legalHeading: "Legal",
    events: "Events",
    offerRide: "Offer a ride",
    help: "Help & FAQ",
    login: "Log in",
    register: "Sign up",
    privacyPolicy: "Privacy Policy",
    termsAndConditions: "Terms and Conditions",
    cookiePolicy: "Cookie Policy",
    communityGuidelines: "Community Guidelines",
    reportProblem: "Report a problem",
    suggestEvent: "Suggest an event",
    rightsReserved: "All rights reserved.",
    socialHeading: "Follow us",
    instagram: "Instagram",
    tiktok: "TikTok",
  },
  languageSwitcher: {
    label: "Language",
  },
  loading: "Loading",
  siteDescription: "Find or offer a ride to your next event.",
  notFound: {
    title: "Page not found",
    description:
      "The page you're looking for doesn't exist or has moved. Check the address, or head back to the home page.",
    cta: "Back to home",
  },
  error: {
    title: "Something went wrong",
    description:
      "An unexpected error occurred. Try again, or head back to the home page if the problem persists.",
    retry: "Try again",
    home: "Back to home",
  },
};

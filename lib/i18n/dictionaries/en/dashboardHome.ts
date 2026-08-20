import type { it } from "../it";

export const dashboardHome: (typeof it)["dashboardHome"] = {
  header: {
    badge: "Dashboard",
    greeting: "Hi {name} 👋",
    subtitle:
      "Welcome to your dashboard. From here you can manage your rides, check your bookings, and organize all your trips to events.",
  },
  stats: {
    ridesPublished: "Rides published",
    bookingsMade: "Bookings made",
    reviews: "Reviews",
    reviewsWithCount: "Reviews ({count})",
    seatsOffered: "Seats offered",
  },
  actions: {
    editProfileTitle: "My profile",
    editProfileDescription:
      "Update your personal details, profile photo, and account information.",
    editProfileCta: "Edit profile",
    offerRideTitle: "Offer a ride",
    offerRideDescription:
      "Share your trip with other participants and split the costs.",
    offerRideCta: "Get started",
    findEventTitle: "Find an event",
    findEventDescription:
      "Explore concerts, festivals, fairs, and sports events and find your next trip.",
    findEventCta: "Explore events",
  },
};

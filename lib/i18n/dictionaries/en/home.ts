import type { it } from "../it";

export const home: (typeof it)["home"] = {
  meta: {
    title: "Car2ne — Find or offer a ride to your next event",
    description:
      "Concerts, festivals, fairs and much more. Car2ne connects people going to the same event so they can share the ride.",
  },
  hero: {
    titleLine1: "Find your",
    titleLine2: "ride",
    titleLine3: "to your next",
    titleLine4: "event.",
    description:
      "Concerts, festivals, fairs and much more. Car2ne connects people heading to the same event so they can share the ride.",
    searchEvent: "Search for an event",
    offerRide: "Offer a ride",
  },
  searchBox: {
    eventPlaceholder: "Search for an event",
    departurePlaceholder: "Departure",
    searchButton: "Search",
  },
  featuredEvents: {
    title: "Featured events",
    subtitle: "Discover the community's most popular events.",
  },
  howItWorks: {
    title: "Just 3 simple steps",
    subtitle: "Car2ne makes it easy to find people heading to the same event as you.",
    steps: [
      {
        title: "Find an event",
        description: "Search concerts, festivals, fairs and any available event.",
      },
      {
        title: "Find a ride",
        description: "Browse the available rides and pick the one that suits you.",
      },
      {
        title: "Travel together",
        description: "Share the ride, save money and meet new people.",
      },
    ],
  },
  features: {
    title: "The easiest way to get to your event.",
    description:
      "Car2ne connects people heading to the same event so they can share the ride, save money and have fun together.",
    items: [
      {
        title: "Save on travel",
        description: "Split fuel and toll costs with people going to the same event as you.",
      },
      {
        title: "Meet new people",
        description: "Travel with people who share your passions.",
      },
      {
        title: "Events everywhere",
        description: "Concerts, festivals, fairs, sports and much more across Italy.",
      },
      {
        title: "A safe community",
        description: "Verified profiles and reviews so you can travel with peace of mind.",
      },
    ],
  },
  cta: {
    title: "Ready for your next event?",
    subtitle: "Find a ride, or help others by sharing yours.",
    searchRide: "Find a ride",
    offerRide: "Offer a ride",
  },
};

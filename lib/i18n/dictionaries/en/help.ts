import type { it } from "../it";

export const help: (typeof it)["help"] = {
  meta: {
    title: "Help & FAQ | Car2ne",
    description:
      "How Car2ne works, how to offer or book a ride, and answers to the most common questions.",
  },
  hero: {
    badge: "❓ Help centre",
    title: "How can we help?",
    subtitle:
      "How Car2ne works and answers to the most common questions. If you can't find what you're looking for, get in touch.",
  },
  guide: {
    title: "In short",
    steps: [
      {
        title: "Find an event",
        description:
          "Search for your event from the homepage or the Events page. If it's not there, suggest it with the link to the official page.",
      },
      {
        title: "Offer or book a ride",
        description:
          "As a driver you publish times, seats and the cost contribution. As a passenger you send a round-trip request that the driver must confirm.",
      },
      {
        title: "Sort out the details and go",
        description:
          "Once the booking is confirmed the chat opens: agree on the meeting point and how to pay the contribution. After the event you can leave each other a review.",
      },
    ],
  },
  faq: {
    title: "Frequently asked questions",
    categories: [
      {
        id: "generale",
        title: "General",
        items: [
          {
            q: "Is Car2ne free?",
            a: "Yes. There are no sign-up fees and no commission. The only money involved is the cost contribution the passenger pays directly to the driver.",
          },
          {
            q: "Does Car2ne take a cut of the ride?",
            a: "No. Car2ne does not handle or process any payment: the money goes directly between passenger and driver. The payment links in the profile are just a convenience.",
          },
          {
            q: "Who can use Car2ne?",
            a: "Anyone aged 18 or older. The date of birth is requested at sign-up only to verify this requirement.",
          },
          {
            q: "Which cities is it available in?",
            a: "Car2ne covers events all over Italy. You can search by departure city and by event city.",
          },
          {
            q: "Can I use Car2ne in English?",
            a: "Yes, the site is bilingual Italian/English. Switch language from the selector at the top: emails follow the chosen language too.",
          },
        ],
      },
      {
        id: "account",
        title: "Account",
        items: [
          {
            q: "How do I sign up?",
            a: "With email and password, or with Google. In both cases you provide your date of birth (18+) and accept the Terms and Privacy Policy.",
          },
          {
            q: "I didn't receive the email verification code.",
            a: "Check your spam folder. You can request a new code from the verification page after a few seconds' cooldown.",
          },
          {
            q: "I forgot my password.",
            a: "Go to \"Forgot password\", enter your email and you'll get a code to set a new one.",
          },
          {
            q: "I signed up with Google, can I also have a password?",
            a: "Yes. In the profile, Password section, you can set a password for email sign-in.",
          },
          {
            q: "Can I change my name, surname or email?",
            a: "Not from the profile page. Write to report@car2ne.com if you need them corrected.",
          },
          {
            q: "How do I delete my account?",
            a: "From the profile, \"Delete account\" section: type DELETE to confirm. Your personal data is anonymized, while rides and reviews stay visible in anonymized form. The action is irreversible.",
          },
        ],
      },
      {
        id: "eventi",
        title: "Events",
        items: [
          {
            q: "I can't find my event.",
            a: "Use \"Suggest an event\" and paste the link to the official page. If the team approves it, the event is added to the catalogue. You need to be registered.",
          },
          {
            q: "The event has passed, can I still do anything?",
            a: "You can no longer search or offer rides, but you can leave a review for the people you travelled with.",
          },
          {
            q: "How do I know if someone publishes a ride for an event?",
            a: "Open the event and tap \"Notify me when there's a ride\". You'll get a notification as soon as a ride is published. Followed events are in the dashboard.",
          },
        ],
      },
      {
        id: "offrire",
        title: "Offering a ride",
        items: [
          {
            q: "Do I have to be registered to fill in the form?",
            a: "No, you can fill it in freely. Sign-in is only requested when you publish and your data isn't lost.",
          },
          {
            q: "How much can I ask as a contribution?",
            a: "An amount in line with splitting the expenses (fuel and tolls) for the round trip. The system suggests an amount based on distance and blocks publishing if the contribution becomes a profit.",
          },
          {
            q: "Can I publish more than one ride for the same event?",
            a: "No, only one per event. You can edit or delete it from \"My rides\".",
          },
          {
            q: "Can I edit an already published ride?",
            a: "Yes: departure city, times, seats, contribution and description. You can't change the event, destination and date.",
          },
          {
            q: "Do I have to accept passengers myself?",
            a: "Yes. Every booking request must be confirmed or rejected by you. You get a notification when a request arrives.",
          },
          {
            q: "What happens if I cancel the ride?",
            a: "A two-step confirmation is required. All passengers with a request or a booking receive a notification and an email.",
          },
          {
            q: "Do I need to be a \"verified driver\" to offer rides?",
            a: "No, verification is optional: it only shows a trust badge on your profile and rides.",
          },
        ],
      },
      {
        id: "prenotare",
        title: "Booking a ride",
        items: [
          {
            q: "How do I book?",
            a: "Open the event, choose a ride and tap \"Request round trip\". The driver must confirm your request.",
          },
          {
            q: "Can I book only the outbound or only the return trip?",
            a: "No, rides on Car2ne are always round trip.",
          },
          {
            q: "My request was rejected.",
            a: "You can send a new one with \"Request again\", or look for another ride.",
          },
          {
            q: "How do I pay the driver?",
            a: "From the \"My bookings\" section, with the PayPal / Revolut / Satispay buttons if the driver set them up, or in cash in person. Payment is always directly between you and the driver.",
          },
          {
            q: "I booked but I can no longer go.",
            a: "Cancel the booking from \"My bookings\": the seat becomes available again for others.",
          },
          {
            q: "The driver cancelled the ride.",
            a: "You get a notification and an email. The booking is marked as cancelled in your dashboard and you can look for another ride.",
          },
        ],
      },
      {
        id: "chat-notifiche",
        title: "Chat and notifications",
        items: [
          {
            q: "I can't message the other person.",
            a: "The chat only becomes active after the booking is confirmed. If it was active and is now closed, it may be because the booking was cancelled, the event has passed or there's a block between users.",
          },
          {
            q: "Where do I find my conversations?",
            a: "On the \"Chat\" page or in the floating chat widget available on every page.",
          },
          {
            q: "I'm not receiving emails.",
            a: "Check your spam folder. Emails arrive in the language set on the site. If the problem persists, report it to report@car2ne.com.",
          },
          {
            q: "How do I enable push notifications?",
            a: "From the profile or the dedicated prompt. If you blocked them in the browser, re-enable them in the browser settings for the Car2ne site.",
          },
        ],
      },
      {
        id: "sicurezza-privacy",
        title: "Safety and privacy",
        items: [
          {
            q: "Does Car2ne vouch for the driver or the condition of the car?",
            a: "No. Car2ne connects people but is not present during the ride. The \"verified driver\" badge only certifies that the submitted documents were reviewed and found consistent.",
          },
          {
            q: "I had a problem with another user.",
            a: "Use \"Report a problem\" or write to report@car2ne.com. You can also block the user from their public profile.",
          },
          {
            q: "The other person didn't show up.",
            a: "Use \"Report no-show\" from the ride or the booking. The team reviews the report.",
          },
          {
            q: "Does Car2ne use tracking cookies?",
            a: "No, only technical cookies necessary for the service to work. No profiling, advertising or third-party analytics.",
          },
          {
            q: "How do I exercise my personal data rights?",
            a: "Write to privacy@car2ne.com for access, rectification, erasure, objection or portability of your data.",
          },
        ],
      },
    ],
  },
  contact: {
    title: "Didn't find the answer?",
    description:
      "Get in touch: we'll reply as soon as possible and keep you updated via notifications.",
    reportCta: "Report a problem",
    reportEmailLabel: "Support and reports",
    reportEmail: "report@car2ne.com",
    privacyEmailLabel: "Privacy and personal data",
    privacyEmail: "privacy@car2ne.com",
  },
};

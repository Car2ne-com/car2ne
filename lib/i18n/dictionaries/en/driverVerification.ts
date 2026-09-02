import type { it } from "../it";

export const driverVerification: (typeof it)["driverVerification"] = {
  page: {
    title: "Driver verification",
    subtitle:
      "Verify your identity and vehicle to earn the \"Verified driver\" badge and build trust with other users.",
  },
  status: {
    pending: "Under review",
    approved: "Verified",
    rejected: "Rejected",
    expired: "Expired",
    pendingDescription:
      "Your request is waiting to be reviewed by our team.",
    approvedDescription:
      "You're a verified driver! The badge is visible on your profile and your rides.",
    rejectedDescription: "Your request wasn't approved.",
    expiredDescription:
      "Your previous request wasn't reviewed in time. You can submit a new one.",
    adminNoteLabel: "Reason",
  },
  form: {
    vehicleMakeLabel: "Vehicle make *",
    vehicleModelLabel: "Vehicle model *",
    vehiclePlateLabel: "License plate *",
    licenseNumberLabel: "Driver's license number *",
    documentLabel: "Document (driver's license or ID card)",
    documentHint:
      "JPG, PNG or PDF · max 5 MB. The document is deleted right after review.",
    submit: "Submit request",
    submitting: "Submitting...",
    resubmit: "Submit a new request",
  },
  toasts: {
    missingFields: "Fill in all required fields.",
    missingDocument: "Upload a document.",
    fileTooLarge: "The file can't exceed 5 MB.",
    unsupportedFile: "Unsupported format. Use JPG, PNG or PDF.",
    submitFailed: "Couldn't submit the request.",
    submitSuccess: "Request submitted! We'll notify you once it's reviewed.",
  },
  badge: "Verified driver",
  dashboardCard: {
    title: "Become a verified driver",
    description:
      "Verify your identity and vehicle to earn a trust badge on your profile.",
    cta: "Verify now",
    ctaPending: "Under review",
    ctaVerified: "Verified driver",
  },
};

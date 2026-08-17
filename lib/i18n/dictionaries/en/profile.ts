import type { it } from "../it";

export const profile: (typeof it)["profile"] = {
  deleteAccount: {
    title: "Delete account",
    description:
      "This action is irreversible: your profile will be anonymized and you will no longer be able to sign in with this account.",
    openButton: "Delete my account",
    warningTitle: "Are you sure?",
    warningBody:
      "Your personal data (name, photo, phone, city, bio) will be removed and you will no longer be able to sign in. Your ride and review history will remain visible to other users in anonymized form.",
    confirmLabel: 'Type "DELETE" to confirm',
    confirmPlaceholder: "DELETE",
    confirmWord: "DELETE",
    confirmButton: "Permanently delete",
    deleting: "Deleting...",
    cancelButton: "Cancel",
    success: "Account deleted. Sorry to see you go!",
    genericError:
      "We couldn't delete your account. Please try again.",
  },
};

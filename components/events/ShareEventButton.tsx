"use client";

import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Dict = {
  button: string;
  message: string;
};

type Props = {
  url: string;
  title: string;
  dict: Dict;
};

/*
 * Su mobile apre il foglio di condivisione nativo (WhatsApp, Instagram
 * DM, Messaggi...), dove in Italia il passaparola vive davvero. Dove
 * navigator.share non c'è (molti browser desktop) ripiega su un link
 * WhatsApp, che apre WhatsApp Web o l'app desktop.
 */
export default function ShareEventButton({ url, title, dict }: Props) {
  async function handleShare() {
    const text = dict.message.replace("{title}", title);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        // L'utente ha annullato il foglio di condivisione: nessun fallback.
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      }
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      `${text} ${url}`
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleShare}
      className="h-10 gap-2 px-5 text-sm font-semibold"
    >
      <Share2 className="h-4 w-4" />
      {dict.button}
    </Button>
  );
}

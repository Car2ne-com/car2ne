"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ImageUploader from "./ImageUploader";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { parsePastedEventText } from "@/lib/admin/parsePastedEventText";

import type { Event, EventCategory } from "@/types/event";

type Dict = {
  newTitle: string;
  editTitle: string;
  newSubtitle: string;
  editSubtitle: string;
  fieldsRequired: string;
  titleLabel: string;
  artistLabel: string;
  venueLabel: string;
  cityLabel: string;
  categoryLabel: string;
  eventDateLabel: string;
  imageLabel: string;
  descriptionLabel: string;
  saving: string;
  saveChanges: string;
  createEvent: string;
  saveFailed: string;
  eventUpdatedToast: string;
  eventCreatedToast: string;
  pasteLabel: string;
  pastePlaceholder: string;
  pasteButton: string;
  pasteHint: string;
  pasteEmptyToast: string;
};

type Props = {
  event?: Event;
  dict: Dict;
  imageUploaderDict: {
    previewAlt: string;
    noImage: string;
    uploading: string;
    uploadImage: string;
  };
};

export default function AdminEventForm({ event, dict, imageUploaderDict }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(event?.title ?? "");
  const [artist, setArtist] = useState(event?.artist ?? "");
  const [venue, setVenue] = useState(event?.venue ?? "");
  const [city, setCity] = useState(event?.city ?? "");
  const [category, setCategory] = useState(
    event?.category ?? "Concerto"
  );

  const [eventDate, setEventDate] = useState(
    event?.event_date
      ? new Date(event.event_date).toISOString().slice(0, 16)
      : ""
  );

  const [description, setDescription] = useState(
    event?.description ?? ""
  );

  const [imageUrl, setImageUrl] = useState(
    event?.image_url ?? ""
  );

  const [loading, setLoading] = useState(false);

  const [pastedText, setPastedText] = useState("");

  /*
   * Pura elaborazione del testo che l'admin ha già copiato a mano
   * dal proprio browser: nessuna richiesta di rete. Best-effort —
   * riempie solo titolo/data se li riconosce e mette il resto del
   * testo in descrizione, l'admin corregge quello che manca (venue,
   * città, artista non vengono indovinati).
   */
  function handlePasteParse() {
    if (!pastedText.trim()) {
      toast.error(dict.pasteEmptyToast);
      return;
    }

    const parsed = parsePastedEventText(pastedText);

    if (parsed.title) setTitle(parsed.title);
    if (parsed.eventDate) setEventDate(parsed.eventDate);
    if (parsed.description) setDescription(parsed.description);
  }

  async function handleSubmit() {
    if (!title || !artist || !venue || !city || !eventDate) {
      toast.error(dict.fieldsRequired);
      return;
    }

    setLoading(true);

    const payload = {
      title,
      artist,
      venue,
      city,
      category,
      event_date: eventDate,
      description: description || null,
      image_url: imageUrl || null,
    };

    const response = await fetch(
      event
        ? `/api/admin/events/${event.id}`
        : "/api/admin/events",
      {
        method: event ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      toast.error(data.error ?? dict.saveFailed);
      return;
    }

    toast.success(
      event
        ? dict.eventUpdatedToast
        : dict.eventCreatedToast
    );

    router.push("/admin/events");
    router.refresh();
  }
    return (
    <Card className="p-10">
      <h1 className="text-2xl font-bold text-foreground">
        {event ? dict.editTitle : dict.newTitle}
      </h1>

      <p className="mt-2 text-muted-foreground">
        {event
          ? dict.editSubtitle
          : dict.newSubtitle}
      </p>

      {!event && (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-4">
          <Label>{dict.pasteLabel}</Label>

          <Textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={dict.pastePlaceholder}
            rows={4}
          />

          <p className="mt-1 text-xs text-muted-foreground">
            {dict.pasteHint}
          </p>

          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handlePasteParse}
              className="h-10 rounded-xl px-5"
            >
              {dict.pasteButton}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label>{dict.titleLabel}</Label>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <Label>{dict.artistLabel}</Label>

          <Input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <Label>{dict.venueLabel}</Label>

          <Input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <Label>{dict.cityLabel}</Label>

          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <Label>{dict.categoryLabel}</Label>

          <Select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value as EventCategory
              )
            }
            className="h-12"
          >
            <option>Concerto</option>
            <option>Festival</option>
            <option>Sport</option>
            <option>Fiera</option>
            <option>Teatro</option>
          </Select>
        </div>

        <div>
          <Label>{dict.eventDateLabel}</Label>

          <Input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="h-12"
          />
        </div>
      </div>

      <div className="mt-8">
        <Label>{dict.imageLabel}</Label>

        <ImageUploader
          value={imageUrl}
          onChange={setImageUrl}
          dict={imageUploaderDict}
        />
      </div>

      <div className="mt-8">
        <Label>{dict.descriptionLabel}</Label>

        <Textarea
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="mt-10 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="h-12 rounded-xl px-8"
        >
          {loading
            ? dict.saving
            : event
              ? dict.saveChanges
              : dict.createEvent}
        </Button>
      </div>
    </Card>
  );
}

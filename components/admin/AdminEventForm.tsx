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
  prefillUrlLabel: string;
  prefillButton: string;
  prefilling: string;
  prefillSuccess: string;
  prefillFailed: string;
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

  const [sourceUrl, setSourceUrl] = useState("");
  const [prefilling, setPrefilling] = useState(false);

  /*
   * Legge UNA sola pagina ticketone.it (mai un crawl) su azione
   * esplicita dell'admin e pre-compila i campi sottostanti.
   * L'admin rivede e conferma prima di salvare: questa funzione non
   * crea l'evento da sola.
   */
  async function handlePrefill() {
    if (!sourceUrl) return;

    setPrefilling(true);

    try {
      const response = await fetch(
        "/api/admin/events/prefill-from-url",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: sourceUrl }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? dict.prefillFailed);
        return;
      }

      if (data.title) setTitle(data.title);
      if (data.artist) setArtist(data.artist);
      if (data.venue) setVenue(data.venue);
      if (data.city) setCity(data.city);
      if (data.eventDate) {
        setEventDate(
          new Date(data.eventDate).toISOString().slice(0, 16)
        );
      }
      if (data.imageUrl) setImageUrl(data.imageUrl);
      if (data.description) setDescription(data.description);

      toast.success(dict.prefillSuccess);
    } catch {
      toast.error(dict.prefillFailed);
    } finally {
      setPrefilling(false);
    }
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
        <div className="mt-10 flex flex-wrap items-end gap-3 rounded-2xl border border-dashed border-border p-4">
          <div className="min-w-[280px] flex-1">
            <Label>{dict.prefillUrlLabel}</Label>

            <Input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://www.ticketone.it/..."
              className="h-12"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handlePrefill}
            disabled={prefilling || !sourceUrl}
            className="h-12 rounded-xl px-6"
          >
            {prefilling ? dict.prefilling : dict.prefillButton}
          </Button>
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

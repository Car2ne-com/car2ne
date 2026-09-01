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
  categoryOptions: Record<Extract<EventCategory, "Concerto" | "Festival" | "Sport" | "Fiera" | "Teatro">, string>;
  eventDateLabel: string;
  imageLabel: string;
  descriptionLabel: string;
  saving: string;
  saveChanges: string;
  createEvent: string;
  saveFailed: string;
  eventUpdatedToast: string;
  eventCreatedToast: string;
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
      <h1 className="text-2xl font-semibold text-foreground">
        {event ? dict.editTitle : dict.newTitle}
      </h1>

      <p className="mt-2 text-muted-foreground">
        {event
          ? dict.editSubtitle
          : dict.newSubtitle}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="event-title">{dict.titleLabel}</Label>

          <Input
            id="event-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <Label htmlFor="event-artist">{dict.artistLabel}</Label>

          <Input
            id="event-artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <Label htmlFor="event-venue">{dict.venueLabel}</Label>

          <Input
            id="event-venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <Label htmlFor="event-city">{dict.cityLabel}</Label>

          <Input
            id="event-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <Label htmlFor="event-category">{dict.categoryLabel}</Label>

          <Select
            id="event-category"
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value as EventCategory
              )
            }
            className="h-12"
          >
            <option value="Concerto">{dict.categoryOptions.Concerto}</option>
            <option value="Festival">{dict.categoryOptions.Festival}</option>
            <option value="Sport">{dict.categoryOptions.Sport}</option>
            <option value="Fiera">{dict.categoryOptions.Fiera}</option>
            <option value="Teatro">{dict.categoryOptions.Teatro}</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="event-date">{dict.eventDateLabel}</Label>

          <Input
            id="event-date"
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
        <Label htmlFor="event-description">{dict.descriptionLabel}</Label>

        <Textarea
          id="event-description"
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="mt-10 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="h-12 px-8"
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

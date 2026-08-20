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

type Props = {
  event?: Event;
};

export default function AdminEventForm({ event }: Props) {
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
      toast.error("Compila tutti i campi obbligatori.");
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
      toast.error(data.error ?? "Salvataggio fallito.");
      return;
    }

    toast.success(
      event
        ? "Evento aggiornato!"
        : "Evento creato!"
    );

    router.push("/admin/events");
    router.refresh();
  }
    return (
    <Card className="p-10">
      <h1 className="text-2xl font-bold text-foreground">
        {event ? "Modifica evento" : "Nuovo evento"}
      </h1>

      <p className="mt-2 text-muted-foreground">
        {event
          ? "Modifica i dati dell'evento."
          : "Compila tutti i dati dell'evento."}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label>Titolo *</Label>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <Label>Artista *</Label>

          <Input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <Label>Venue *</Label>

          <Input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <Label>Città *</Label>

          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <Label>Categoria</Label>

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
          <Label>Data evento *</Label>

          <Input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="h-12"
          />
        </div>
      </div>

      <div className="mt-8">
        <Label>Immagine evento</Label>

        <ImageUploader
          value={imageUrl}
          onChange={setImageUrl}
        />
      </div>

      <div className="mt-8">
        <Label>Descrizione</Label>

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
            ? "Salvataggio..."
            : event
              ? "Salva modifiche"
              : "Crea evento"}
        </Button>
      </div>
    </Card>
  );
}

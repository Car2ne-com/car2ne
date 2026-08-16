"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ImageUploader from "./ImageUploader";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

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
    <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900">
        {event ? "Modifica evento" : "Nuovo evento"}
      </h1>

      <p className="mt-2 text-slate-500">
        {event
          ? "Modifica i dati dell'evento."
          : "Compila tutti i dati dell'evento."}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold">
            Titolo *
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-300 px-4"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Artista *
          </label>

          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-300 px-4"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Venue *
          </label>

          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-300 px-4"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Città *
          </label>

          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-300 px-4"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Categoria
          </label>

          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value as EventCategory
              )
            }
            className="h-12 w-full rounded-xl border border-slate-300 px-4"
          >
            <option>Concerto</option>
            <option>Festival</option>
            <option>Sport</option>
            <option>Fiera</option>
            <option>Teatro</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Data evento *
          </label>

          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-300 px-4"
          />
        </div>
      </div>

      <div className="mt-8">
        <label className="mb-3 block font-semibold">
          Immagine evento
        </label>

        <ImageUploader
          value={imageUrl}
          onChange={setImageUrl}
        />
      </div>

      <div className="mt-8">
        <label className="mb-2 block font-semibold">
          Descrizione
        </label>

        <textarea
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-slate-300 p-4"
        />
      </div>

      <div className="mt-10 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="h-12 rounded-xl bg-emerald-500 px-8 hover:bg-emerald-600"
        >
          {loading
            ? "Salvataggio..."
            : event
              ? "Salva modifiche"
              : "Crea evento"}
        </Button>
      </div>
    </section>
  );
}
"use client";

import { useState } from "react";

import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Dict = {
  form: {
    titleLabel: string;
    artistLabel: string;
    venueLabel: string;
    cityLabel: string;
    eventDateLabel: string;
    externalUrlLabel: string;
    externalUrlHint: string;
    imageUrlLabel: string;
    imageUrlHint: string;
    descriptionLabel: string;
    submit: string;
    submitting: string;
  };
  toasts: {
    missingFields: string;
    submitFailed: string;
    submitSuccess: string;
  };
  success: {
    title: string;
    description: string;
    another: string;
  };
};

export default function EventSuggestionForm({ dict }: { dict: Dict }) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function reset() {
    setTitle("");
    setArtist("");
    setVenue("");
    setCity("");
    setEventDate("");
    setExternalUrl("");
    setImageUrl("");
    setDescription("");
    setSubmitted(false);
  }

  async function handleSubmit() {
    if (!title || !artist || !venue || !city || !eventDate) {
      toast.error(dict.toasts.missingFields);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/event-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          artist,
          venue,
          city,
          event_date: eventDate,
          external_url: externalUrl || null,
          image_url: imageUrl || null,
          description: description || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? dict.toasts.submitFailed);
        return;
      }

      toast.success(dict.toasts.submitSuccess);
      setSubmitted(true);
    } catch {
      toast.error(dict.toasts.submitFailed);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card className="mt-10 p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-foreground">
          {dict.success.title}
        </h2>

        <p className="mt-2 text-muted-foreground">
          {dict.success.description}
        </p>

        <Button
          type="button"
          onClick={reset}
          className="mt-6 h-12 rounded-2xl px-8 text-base font-semibold"
        >
          {dict.success.another}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mt-10 p-8 shadow-sm">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label>{dict.form.titleLabel}</Label>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
            className="h-12"
          />
        </div>

        <div>
          <Label>{dict.form.artistLabel}</Label>

          <Input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            disabled={submitting}
            className="h-12"
          />
        </div>

        <div>
          <Label>{dict.form.venueLabel}</Label>

          <Input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            disabled={submitting}
            className="h-12"
          />
        </div>

        <div>
          <Label>{dict.form.cityLabel}</Label>

          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={submitting}
            className="h-12"
          />
        </div>

        <div>
          <Label>{dict.form.eventDateLabel}</Label>

          <Input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            disabled={submitting}
            className="h-12"
          />
        </div>

        <div>
          <Label>{dict.form.externalUrlLabel}</Label>

          <Input
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            disabled={submitting}
            placeholder="https://..."
            className="h-12"
          />

          <p className="mt-1 text-xs text-muted-foreground">
            {dict.form.externalUrlHint}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Label>{dict.form.imageUrlLabel}</Label>

        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          disabled={submitting}
          placeholder="https://..."
          className="h-12"
        />

        <p className="mt-1 text-xs text-muted-foreground">
          {dict.form.imageUrlHint}
        </p>
      </div>

      <div className="mt-6">
        <Label>{dict.form.descriptionLabel}</Label>

        <Textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
        />
      </div>

      <div className="mt-8 flex justify-end border-t border-border pt-6">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="h-12 rounded-2xl px-8 text-base font-semibold"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {dict.form.submitting}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {dict.form.submit}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

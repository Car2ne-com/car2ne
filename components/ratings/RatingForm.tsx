"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import RatingStars from "@/components/ratings/RatingStars";
import { createClient } from "@/lib/supabase/client";

type Props = {
  bookingId: string;
  rideId: string;
  rateeId: string;
  rateeName: string;
};

type ExistingRating = {
  rating: number;
  comment: string | null;
} | null;

export default function RatingForm({
  bookingId,
  rideId,
  rateeId,
  rateeName,
}: Props) {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [existing, setExisting] =
    useState<ExistingRating>(null);

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    async function loadExisting() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("ratings")
        .select("rating, comment")
        .eq("booking_id", bookingId)
        .eq("rater_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setExisting(data);
      }

      setLoading(false);
    }

    loadExisting();
  }, [bookingId, supabase]);

  async function handleSubmit() {
    if (rating < 1) {
      toast.error(
        "Seleziona almeno una stella."
      );
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from("ratings")
      .insert({
        booking_id: bookingId,
        ride_id: rideId,
        rater_id: user.id,
        ratee_id: rateeId,
        rating,
        comment: comment.trim() || null,
      });

    setSubmitting(false);

    if (error) {
      console.error(
        "Errore invio recensione:",
        error
      );

      toast.error(error.message);
      return;
    }

    toast.success("Recensione inviata!");

    setExisting({
      rating,
      comment: comment.trim() || null,
    });

    setOpen(false);
  }

  if (loading) {
    return null;
  }

  if (existing) {
    return (
      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-semibold text-slate-500">
          La tua recensione
        </p>

        <div className="mt-2">
          <RatingStars value={existing.rating} />
        </div>

        {existing.comment && (
          <p className="mt-2 text-sm text-slate-600">
            {existing.comment}
          </p>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="mt-6 h-10 w-full rounded-2xl text-sm font-semibold"
      >
        Lascia una recensione a {rateeName}
      </Button>
    );
  }

  return (
    <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-700">
        Recensisci {rateeName}
      </p>

      <RatingStars
        value={rating}
        onChange={setRating}
        size={24}
      />

      <textarea
        value={comment}
        onChange={(e) =>
          setComment(e.target.value)
        }
        rows={3}
        maxLength={300}
        placeholder="Com'è andata? (facoltativo)"
        className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />

      <div className="flex gap-2">
        <Button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          className="h-10 rounded-2xl bg-emerald-500 px-5 text-sm font-semibold hover:bg-emerald-600"
        >
          {submitting
            ? "Invio..."
            : "Invia recensione"}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => setOpen(false)}
          className="h-10 rounded-2xl px-5 text-sm font-semibold"
        >
          Annulla
        </Button>
      </div>
    </div>
  );
}

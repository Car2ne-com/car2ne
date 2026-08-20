"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import RatingStars from "@/components/ratings/RatingStars";
import { createClient } from "@/lib/supabase/client";

type Dict = {
  starLabel: string;
  selectStar: string;
  submitted: string;
  yourReview: string;
  leaveReviewButton: string;
  reviewPrompt: string;
  commentPlaceholder: string;
  sending: string;
  sendButton: string;
  cancelButton: string;
};

type Props = {
  dict: Dict;
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
  dict,
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
      toast.error(dict.selectStar);
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

    toast.success(dict.submitted);

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
      <Card className="mt-6 bg-muted p-4">
        <p className="text-xs font-semibold text-muted-foreground">
          {dict.yourReview}
        </p>

        <div className="mt-2">
          <RatingStars value={existing.rating} starLabel={dict.starLabel} />
        </div>

        {existing.comment && (
          <p className="mt-2 text-sm text-muted-foreground">
            {existing.comment}
          </p>
        )}
      </Card>
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
        {dict.leaveReviewButton.replace("{name}", rateeName)}
      </Button>
    );
  }

  return (
    <Card className="mt-6 space-y-3 bg-muted p-4">
      <p className="text-sm font-semibold text-foreground/90">
        {dict.reviewPrompt.replace("{name}", rateeName)}
      </p>

      <RatingStars
        value={rating}
        onChange={setRating}
        size={24}
        starLabel={dict.starLabel}
      />

      <Textarea
        value={comment}
        onChange={(e) =>
          setComment(e.target.value)
        }
        rows={3}
        maxLength={300}
        placeholder={dict.commentPlaceholder}
        className="bg-background"
      />

      <div className="flex gap-2">
        <Button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          className="h-10 rounded-2xl bg-primary px-5 text-sm font-semibold hover:bg-primary/90"
        >
          {submitting
            ? dict.sending
            : dict.sendButton}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => setOpen(false)}
          className="h-10 rounded-2xl px-5 text-sm font-semibold"
        >
          {dict.cancelButton}
        </Button>
      </div>
    </Card>
  );
}

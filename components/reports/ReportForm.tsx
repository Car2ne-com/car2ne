"use client";

import { useEffect, useState } from "react";

import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { createClient } from "@/lib/supabase/client";

type Dict = {
  form: {
    categoryLabel: string;
    categories: Record<string, string>;
    targetUserBanner: string;
    rideLabel: string;
    rideNone: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    submit: string;
    submitting: string;
  };
  toasts: {
    missingCategory: string;
    missingDescription: string;
    submitFailed: string;
    submitSuccess: string;
  };
  success: {
    title: string;
    description: string;
    another: string;
  };
};

type RideOption = {
  key: string;
  label: string;
  rideId: string | null;
  bookingId: string | null;
};

type TargetUser = {
  id: string;
  name: string;
};

type Props = {
  dict: Dict;
  locale: "it" | "en";
  targetUser?: TargetUser | null;
};

export default function ReportForm({ dict, locale, targetUser }: Props) {
  const supabase = createClient();

  const [category, setCategory] = useState(
    targetUser ? "user_behavior" : ""
  );
  const [description, setDescription] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [options, setOptions] = useState<RideOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadContext() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const dateFormat = (date: string, time: string) =>
        new Date(`${date}T${time}`).toLocaleDateString(
          locale === "en" ? "en-US" : "it-IT"
        );

      const [ridesResult, bookingsResult] = await Promise.all([
        supabase
          .from("rides")
          .select("id, destination, departure_date, departure_time")
          .eq("driver_id", user.id)
          .order("departure_date", { ascending: false })
          .limit(10),

        supabase
          .from("bookings")
          .select(
            "id, ride:rides(destination, departure_date, departure_time)"
          )
          .eq("passenger_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const rideOptions: RideOption[] = (ridesResult.data ?? []).map(
        (r) => ({
          key: `ride:${r.id}`,
          label: `${r.destination} · ${dateFormat(r.departure_date, r.departure_time)}`,
          rideId: r.id,
          bookingId: null,
        })
      );

      const bookingOptions: RideOption[] = (bookingsResult.data ?? [])
        .filter((b) => b.ride)
        .map((b) => {
          const ride = Array.isArray(b.ride) ? b.ride[0] : b.ride;

          return {
            key: `booking:${b.id}`,
            label: `${ride.destination} · ${dateFormat(ride.departure_date, ride.departure_time)}`,
            rideId: null,
            bookingId: b.id,
          };
        });

      setOptions([...rideOptions, ...bookingOptions]);
    }

    loadContext();
  }, [supabase, locale]);

  async function handleSubmit() {
    if (!category) {
      toast.error(dict.toasts.missingCategory);
      return;
    }

    if (!description.trim()) {
      toast.error(dict.toasts.missingDescription);
      return;
    }

    setSubmitting(true);

    try {
      const selected = options.find((o) => o.key === selectedOption);

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description: description.trim(),
          rideId: selected?.rideId ?? null,
          bookingId: selected?.bookingId ?? null,
          targetUserId: targetUser?.id ?? null,
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

        <p className="mt-2 text-muted-foreground">{dict.success.description}</p>

        <Button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setCategory("");
            setDescription("");
            setSelectedOption("");
          }}
          className="mt-6 h-12 rounded-2xl px-8 text-base font-semibold"
        >
          {dict.success.another}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mt-10 p-8 shadow-sm">
      {targetUser && (
        <div className="mb-6 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground">
          {dict.form.targetUserBanner.replace("{name}", targetUser.name)}
        </div>
      )}

      <div className="mb-6">
        <Label htmlFor="report-category">{dict.form.categoryLabel}</Label>

        <Select
          id="report-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={submitting}
          className="h-14 rounded-2xl"
        >
          <option value="">—</option>

          {Object.entries(dict.form.categories).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {options.length > 0 && (
        <div className="mb-6">
          <Label htmlFor="report-ride">{dict.form.rideLabel}</Label>

          <Select
            id="report-ride"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            disabled={submitting}
            className="h-14 rounded-2xl"
          >
            <option value="">{dict.form.rideNone}</option>

            {options.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="report-description">{dict.form.descriptionLabel}</Label>

        <Textarea
          id="report-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
          rows={6}
          maxLength={2000}
          placeholder={dict.form.descriptionPlaceholder}
          className="rounded-2xl py-4"
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

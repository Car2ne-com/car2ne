"use client";

import { useEffect, useState } from "react";

import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { createClient } from "@/lib/supabase/client";

type Dict = {
  form: {
    categoryLabel: string;
    categories: Record<string, string>;
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

type Props = {
  dict: Dict;
  locale: "it" | "en";
};

export default function ReportForm({ dict, locale }: Props) {
  const supabase = createClient();

  const [category, setCategory] = useState("");
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
      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          {dict.success.title}
        </h2>

        <p className="mt-2 text-slate-600">{dict.success.description}</p>

        <Button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setCategory("");
            setDescription("");
            setSelectedOption("");
          }}
          className="mt-6 h-12 rounded-2xl bg-emerald-500 px-8 font-semibold hover:bg-emerald-600"
        >
          {dict.success.another}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          {dict.form.categoryLabel}
        </label>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={submitting}
          className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
        >
          <option value="">—</option>

          {Object.entries(dict.form.categories).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {options.length > 0 && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            {dict.form.rideLabel}
          </label>

          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            disabled={submitting}
            className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="">{dict.form.rideNone}</option>

            {options.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          {dict.form.descriptionLabel}
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
          rows={6}
          maxLength={2000}
          placeholder={dict.form.descriptionPlaceholder}
          className="w-full rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
      </div>

      <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="h-12 rounded-2xl bg-emerald-500 px-8 font-semibold hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
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
    </div>
  );
}

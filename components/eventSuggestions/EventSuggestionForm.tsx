"use client";

import { useState } from "react";

import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Dict = {
  form: {
    urlLabel: string;
    urlPlaceholder: string;
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
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!url.trim()) {
      toast.error(dict.toasts.missingFields);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/event-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
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
        <h2 className="text-xl font-semibold text-foreground">
          {dict.success.title}
        </h2>

        <p className="mt-2 text-muted-foreground">
          {dict.success.description}
        </p>

        <Button
          type="button"
          onClick={() => {
            setUrl("");
            setSubmitted(false);
          }}
          className="mt-6 h-12 px-8 text-base font-semibold"
        >
          {dict.success.another}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mt-10 p-8 shadow-sm">
      <Label htmlFor="event-suggestion-url">{dict.form.urlLabel}</Label>

      <Input
        id="event-suggestion-url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={submitting}
        placeholder={dict.form.urlPlaceholder}
        className="h-12"
      />

      <div className="mt-8 flex justify-end border-t border-border pt-6">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="h-12 px-8 text-base font-semibold"
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

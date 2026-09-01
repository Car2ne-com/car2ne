"use client";

import { useMemo, useRef, useState } from "react";

import { Search, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { buildIndex, searchFaq, type FaqItem } from "@/lib/help/faqSearch";

type AssistantDict = {
  title: string;
  subtitle: string;
  disclaimer: string;
  greeting: string;
  inputPlaceholder: string;
  sendLabel: string;
  resultsIntro: string;
  noResults: string;
  suggestionsTitle: string;
  suggestions: string[];
};

type Turn = { query: string; results: FaqItem[] };

export default function AssistantPanel({
  dict,
  faqItems,
}: {
  dict: AssistantDict;
  faqItems: FaqItem[];
}) {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const index = useMemo(() => buildIndex(faqItems), [faqItems]);

  function search(text: string) {
    const query = text.trim();

    if (!query) return;

    const results = searchFaq(query, index);

    setInput("");
    setTurns((current) => [...current, { query, results }]);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }

  const showIntro = turns.length === 0;

  return (
    <Card className="mt-16 overflow-hidden shadow-sm">
      <div className="border-b border-border bg-muted/40 p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="font-semibold text-foreground">{dict.title}</h2>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">{dict.subtitle}</p>
      </div>

      <div
        ref={scrollRef}
        className="max-h-[30rem] space-y-4 overflow-y-auto p-5"
        aria-live="polite"
      >
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm leading-6 text-foreground">
          {dict.greeting}
        </div>

        {showIntro && (
          <div className="pt-1">
            <p className="text-xs font-semibold text-muted-foreground">
              {dict.suggestionsTitle}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {dict.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => search(suggestion)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-left text-xs font-medium text-foreground transition hover:bg-muted"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((turn, turnIndex) => (
          <div key={turnIndex} className="space-y-4">
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm leading-6 text-primary-foreground">
              {turn.query}
            </div>

            <div className="max-w-[92%] space-y-3">
              <p className="text-sm text-foreground">
                {turn.results.length > 0 ? dict.resultsIntro : dict.noResults}
              </p>

              {turn.results.map((result) => (
                <div
                  key={result.q}
                  className="rounded-2xl rounded-tl-sm border border-border bg-muted px-4 py-3"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {result.q}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {result.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <form
        className="flex items-end gap-2 border-t border-border p-4"
        onSubmit={(event) => {
          event.preventDefault();
          search(input);
        }}
      >
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              search(input);
            }
          }}
          rows={1}
          placeholder={dict.inputPlaceholder}
          className="max-h-32 min-h-11 flex-1 resize-none"
        />

        <Button
          type="submit"
          size="icon-lg"
          disabled={!input.trim()}
          aria-label={dict.sendLabel}
        >
          <Search className="size-4" />
        </Button>
      </form>

      <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
        {dict.disclaimer}
      </p>
    </Card>
  );
}

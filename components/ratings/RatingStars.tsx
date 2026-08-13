"use client";

import { Star } from "lucide-react";

type Props = {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
};

export default function RatingStars({
  value,
  onChange,
  size = 20,
}: Props) {
  const interactive = !!onChange;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          aria-label={`${star} stelle`}
          className={
            interactive
              ? "cursor-pointer"
              : "cursor-default"
          }
        >
          <Star
            style={{
              width: size,
              height: size,
            }}
            className={
              star <= Math.round(value)
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-slate-300"
            }
          />
        </button>
      ))}
    </div>
  );
}

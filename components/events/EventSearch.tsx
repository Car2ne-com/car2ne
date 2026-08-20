"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export default function EventSearch({
  value,
  onChange,
  placeholder,
}: Props) {
  return (
    <div className="relative">

      <Search
        className="
          absolute
          left-6
          top-1/2
          h-5
          w-5
          -translate-y-1/2
          text-muted-foreground
        "
      />

      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          h-16
          rounded-2xl
          pl-14
          pr-5
          text-base
          shadow-sm
          placeholder:truncate
          sm:text-lg
        "
      />

    </div>
  );
}

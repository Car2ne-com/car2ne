"use client";

import { Search } from "lucide-react";

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
          text-slate-400
        "
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          h-16
          w-full
          rounded-2xl
          border
          border-slate-200
          bg-white
          pl-14
          pr-5
          text-base
          text-slate-900
          shadow-sm
          outline-none
          transition-all
          duration-300
          placeholder:text-slate-400
          placeholder:truncate
          focus:border-emerald-500
          focus:ring-4
          focus:ring-emerald-100
          sm:text-lg
        "
      />

    </div>
  );
}
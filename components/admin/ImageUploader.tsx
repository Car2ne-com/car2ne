"use client";

import { useRef, useState } from "react";
import { Upload, ImageIcon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export default function ImageUploader({
  value,
  onChange,
}: Props) {
  const supabase = createClient();

  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);

  async function uploadImage(file: File) {
    setUploading(true);

    const extension = file.name.split(".").pop();

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const path = `events/${fileName}`;

    const { error } = await supabase.storage
      .from("event-images")
      .upload(path, file);

    if (error) {
      console.error(error);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("event-images")
      .getPublicUrl(path);

    onChange(publicUrl);

    setUploading(false);
  }

  return (
    <div className="space-y-4">
      {value ? (
        <img
          src={value}
          alt="Anteprima evento"
          className="h-56 w-full rounded-2xl object-cover"
        />
      ) : (
        <div className="flex h-56 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
          <div className="text-center">
            <ImageIcon className="mx-auto mb-3 h-10 w-10 text-slate-400" />

            <p className="text-sm text-slate-500">
              Nessuna immagine caricata
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        hidden
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) uploadImage(file);
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-500 px-6 font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Caricamento...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Carica immagine
          </>
        )}
      </button>
    </div>
  );
}
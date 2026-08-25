"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, ImageIcon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type Dict = {
  previewAlt: string;
  noImage: string;
  uploading: string;
  uploadImage: string;
};

type Props = {
  value: string;
  onChange: (url: string) => void;
  dict: Dict;
};

export default function ImageUploader({
  value,
  onChange,
  dict,
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
        <div className="relative h-56 w-full overflow-hidden rounded-2xl">
          <Image
            src={value}
            alt={dict.previewAlt}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-56 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted">
          <div className="text-center">
            <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

            <p className="text-sm text-muted-foreground">
              {dict.noImage}
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

      <Button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="h-12 gap-2 rounded-xl px-6"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {dict.uploading}
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            {dict.uploadImage}
          </>
        )}
      </Button>
    </div>
  );
}

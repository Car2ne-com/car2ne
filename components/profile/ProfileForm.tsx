"use client";

import {
  ChangeEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  Camera,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  name: string;
  surname: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
};

type Props = {
  profile: Profile;
};

export default function ProfileForm({
  profile,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [city, setCity] = useState(
    profile.city ?? ""
  );

  const [bio, setBio] = useState(
    profile.bio ?? ""
  );

  const [avatarUrl, setAvatarUrl] = useState(
    profile.avatar_url
  );

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [uploadingAvatar, setUploadingAvatar] =
    useState(false);

  const displayName =
    `${profile.name} ${profile.surname}`.trim();

  const initials =
    `${profile.name.charAt(0)}${profile.surname.charAt(0)}`
      .toUpperCase();

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Formato non supportato. Usa JPG, PNG o WebP."
      );

      event.target.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error(
        "L'immagine non può superare 2 MB."
      );

      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl =
      URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(newPreviewUrl);
  }

  async function handleAvatarUpload() {
    if (!selectedFile) {
      return true;
    }

    setUploadingAvatar(true);

    try {
      /*
       * ==============================
       * AUTENTICAZIONE
       * ==============================
       */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      /*
       * ==============================
       * CONTROLLO UTENTE
       * ==============================
       */

      if (userError) {
        console.error(
          "Errore recupero utente:",
          userError
        );

        toast.error(
          "Errore nel recupero della sessione."
        );

        return false;
      }

      if (!user) {
        console.error(
          "Nessun utente autenticato."
        );

        toast.error(
          "La sessione non è valida. Effettua nuovamente il login."
        );

        router.push("/login");

        return false;
      }

      /*
       * ==============================
       * ESTENSIONE FILE
       * ==============================
       */

      const extension =
        selectedFile.type === "image/png"
          ? "png"
          : selectedFile.type ===
              "image/webp"
            ? "webp"
            : "jpg";

      /*
       * ==============================
       * PERCORSO AVATAR
       *
       * Usiamo un nome sempre diverso.
       * Questo evita completamente upsert.
       * ==============================
       */

      const filePath =
        `${user.id}/avatar-${Date.now()}.${extension}`;

      /*
       * ==============================
       * UPLOAD
       * ==============================
       */

      const {
        error: uploadError,
      } = await supabase.storage
        .from("avatars")
        .upload(
          filePath,
          selectedFile,
          {
            cacheControl: "3600",
            contentType:
              selectedFile.type,
            upsert: false,
          }
        );

      if (uploadError) {
        console.error(
          "Errore upload avatar:",
          uploadError
        );

        toast.error(
          uploadError.message ||
            "Non è stato possibile caricare l'immagine."
        );

        return false;
      }

      /*
       * ==============================
       * URL PUBBLICO
       * ==============================
       */

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const newAvatarUrl =
        publicUrlData.publicUrl;

      /*
       * ==============================
       * AGGIORNAMENTO PROFILO
       * ==============================
       */

      const {
        error: profileError,
      } = await supabase
        .from("profiles")
        .update({
          avatar_url: newAvatarUrl,
        })
        .eq("id", user.id);

      if (profileError) {
        console.error(
          "Errore aggiornamento avatar profilo:",
          profileError
        );

        toast.error(
          "Immagine caricata, ma non è stato possibile aggiornare il profilo."
        );

        return false;
      }

      /*
       * ==============================
       * STATO LOCALE
       * ==============================
       */

      setAvatarUrl(newAvatarUrl);
      setSelectedFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      toast.success(
        "Foto profilo aggiornata!"
      );

      return true;
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave() {
    if (loading || uploadingAvatar) {
      return;
    }

    setLoading(true);

    /*
     * Se è stata selezionata una nuova foto,
     * prima effettuiamo l'upload.
     */

    const avatarSuccess =
      await handleAvatarUpload();

    if (!avatarSuccess) {
      setLoading(false);
      return;
    }

    /*
     * ==============================
     * SALVATAGGIO PROFILO
     * ==============================
     */

    const { error } = await supabase
      .from("profiles")
      .update({
        city: city.trim() || null,
        bio: bio.trim() || null,
      })
      .eq("id", profile.id);

    setLoading(false);

    if (error) {
      console.error(
        "Errore aggiornamento profilo:",
        error
      );

      toast.error(
        "Non è stato possibile aggiornare il profilo."
      );

      return;
    }

    toast.success(
      "Profilo aggiornato con successo!"
    );

    router.refresh();
  }

  const isSaving =
    loading || uploadingAvatar;

  return (
    <div className="space-y-6">

      {/* ==============================
          HEADER PROFILO
          ============================== */}

      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">

        <div className="flex flex-col items-center">

          {/* Avatar */}

          <div className="relative">

            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Anteprima avatar"
                className="h-28 w-28 rounded-full object-cover ring-4 ring-emerald-50"
              />
            ) : avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={112}
                height={112}
                className="h-28 w-28 rounded-full object-cover ring-4 ring-emerald-50"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100 text-3xl font-black text-emerald-600 ring-4 ring-emerald-50">
                {initials}
              </div>
            )}

            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-white shadow-md transition hover:bg-emerald-600"
            >
              <Camera className="h-5 w-5" />

              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={isSaving}
                className="hidden"
              />
            </label>

          </div>

          <p className="mt-4 text-sm text-slate-500">
            JPG, PNG o WebP · massimo 2 MB
          </p>

          {selectedFile && (
            <p className="mt-2 text-sm font-semibold text-emerald-600">
              Nuova foto selezionata
            </p>
          )}

          <h2 className="mt-6 text-3xl font-bold text-slate-900">
            {displayName}
          </h2>

          <p className="mt-2 text-slate-500">
            {profile.email}
          </p>

          <span className="mt-4 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-semibold text-emerald-700">
            Membro Car2ne
          </span>

        </div>

      </div>

      {/* ==============================
          INFORMAZIONI ACCOUNT
          ============================== */}

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Informazioni account
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Questi dati identificano il tuo account
            e non possono essere modificati da questa
            pagina.
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">

          {/* Nome */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nome
            </label>

            <input
              value={profile.name}
              disabled
              className="h-14 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 text-slate-500 outline-none"
            />
          </div>

          {/* Cognome */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Cognome
            </label>

            <input
              value={profile.surname}
              disabled
              className="h-14 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 text-slate-500 outline-none"
            />
          </div>

          {/* Email */}

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>

            <input
              value={profile.email}
              disabled
              className="h-14 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 text-slate-500 outline-none"
            />
          </div>

        </div>

      </div>

      {/* ==============================
          PROFILO PUBBLICO
          ============================== */}

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Profilo pubblico
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Queste informazioni potranno essere
            visibili agli altri utenti quando offrirai
            o prenoterai un passaggio.
          </p>
        </div>

        {/* Città */}

        <div className="mt-6">

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Città
          </label>

          <input
            value={city}
            onChange={(e) =>
              setCity(e.target.value)
            }
            disabled={isSaving}
            placeholder="Milano"
            maxLength={100}
            className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

        </div>

        {/* Biografia */}

        <div className="mt-6">

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Biografia
          </label>

          <textarea
            value={bio}
            onChange={(e) =>
              setBio(e.target.value)
            }
            disabled={isSaving}
            rows={6}
            maxLength={300}
            placeholder="Parla un po' di te..."
            className="w-full rounded-2xl border border-slate-200 p-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <div className="mt-2 flex justify-between text-xs text-slate-400">

            <span>
              Una breve descrizione che aiuti gli
              altri a conoscerti.
            </span>

            <span>
              {bio.length}/300
            </span>

          </div>

        </div>

        {/* Salvataggio */}

        <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-12 rounded-2xl bg-emerald-500 px-8 font-semibold hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio...
              </>
            ) : (
              "Salva modifiche"
            )}
          </Button>

        </div>

      </div>

    </div>
  );
}
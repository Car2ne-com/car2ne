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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

type Dict = {
  avatarPreviewAlt: string;
  avatarHint: string;
  newPhotoSelected: string;
  memberBadge: string;
  accountInfoTitle: string;
  accountInfoDescription: string;
  nameLabel: string;
  surnameLabel: string;
  emailLabel: string;
  publicProfileTitle: string;
  publicProfileDescription: string;
  cityLabel: string;
  cityPlaceholder: string;
  bioLabel: string;
  bioPlaceholder: string;
  bioHint: string;
  saving: string;
  saveButton: string;
  errors: {
    unsupportedFormat: string;
    imageTooLarge: string;
    sessionError: string;
    sessionInvalid: string;
    uploadFailed: string;
    profileUpdateAfterUploadFailed: string;
    updateFailed: string;
  };
  success: {
    avatarUpdated: string;
    profileUpdated: string;
  };
};

type Props = {
  profile: Profile;
  dict: Dict;
};

export default function ProfileForm({
  profile,
  dict,
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
      toast.error(dict.errors.unsupportedFormat);

      event.target.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error(dict.errors.imageTooLarge);

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

        toast.error(dict.errors.sessionError);

        return false;
      }

      if (!user) {
        console.error(
          "Nessun utente autenticato."
        );

        toast.error(dict.errors.sessionInvalid);

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
            dict.errors.uploadFailed
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

        toast.error(dict.errors.profileUpdateAfterUploadFailed);

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

      toast.success(dict.success.avatarUpdated);

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

      toast.error(dict.errors.updateFailed);

      return;
    }

    toast.success(dict.success.profileUpdated);

    router.refresh();
  }

  const isSaving =
    loading || uploadingAvatar;

  return (
    <div className="space-y-6">

      {/* ==============================
          HEADER PROFILO
          ============================== */}

      <Card className="p-10">

        <div className="flex flex-col items-center">

          {/* Avatar */}

          <div className="relative">

            {previewUrl ? (
              <img
                src={previewUrl}
                alt={dict.avatarPreviewAlt}
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

          <p className="mt-4 text-sm text-muted-foreground">
            {dict.avatarHint}
          </p>

          {selectedFile && (
            <p className="mt-2 text-sm font-semibold text-emerald-600">
              {dict.newPhotoSelected}
            </p>
          )}

          <h2 className="mt-6 text-2xl font-bold text-foreground">
            {displayName}
          </h2>

          <p className="mt-2 text-muted-foreground">
            {profile.email}
          </p>

          <span className="mt-4 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-semibold text-emerald-700">
            {dict.memberBadge}
          </span>

        </div>

      </Card>

      {/* ==============================
          INFORMAZIONI ACCOUNT
          ============================== */}

      <Card className="p-8">

        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {dict.accountInfoTitle}
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {dict.accountInfoDescription}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Nome */}

          <div>
            <Label>{dict.nameLabel}</Label>

            <Input
              value={profile.name}
              disabled
              className="h-14 rounded-2xl"
            />
          </div>

          {/* Cognome */}

          <div>
            <Label>{dict.surnameLabel}</Label>

            <Input
              value={profile.surname}
              disabled
              className="h-14 rounded-2xl"
            />
          </div>

          {/* Email */}

          <div className="md:col-span-2">
            <Label>{dict.emailLabel}</Label>

            <Input
              value={profile.email}
              disabled
              className="h-14 rounded-2xl"
            />
          </div>

        </div>

      </Card>

      {/* ==============================
          PROFILO PUBBLICO
          ============================== */}

      <Card className="p-8">

        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {dict.publicProfileTitle}
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {dict.publicProfileDescription}
          </p>
        </div>

        {/* Città */}

        <div className="mt-6">

          <Label>{dict.cityLabel}</Label>

          <Input
            value={city}
            onChange={(e) =>
              setCity(e.target.value)
            }
            disabled={isSaving}
            placeholder={dict.cityPlaceholder}
            maxLength={100}
            className="h-14 rounded-2xl"
          />

        </div>

        {/* Biografia */}

        <div className="mt-6">

          <Label>{dict.bioLabel}</Label>

          <Textarea
            value={bio}
            onChange={(e) =>
              setBio(e.target.value)
            }
            disabled={isSaving}
            rows={6}
            maxLength={300}
            placeholder={dict.bioPlaceholder}
            className="rounded-2xl p-4"
          />

          <div className="mt-2 flex justify-between text-xs text-slate-400">

            <span>
              {dict.bioHint}
            </span>

            <span>
              {bio.length}/300
            </span>

          </div>

        </div>

        {/* Salvataggio */}

        <div className="mt-8 flex justify-end border-t border-border pt-6">

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-12 rounded-2xl bg-emerald-500 px-8 font-semibold hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {dict.saving}
              </>
            ) : (
              dict.saveButton
            )}
          </Button>

        </div>

      </Card>

    </div>
  );
}

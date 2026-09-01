"use client";

import { ChangeEvent, useState } from "react";

import { useRouter } from "next/navigation";

import {
  BadgeCheck,
  Clock3,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createClient } from "@/lib/supabase/client";

type Dict = {
  status: {
    pending: string;
    approved: string;
    rejected: string;
    expired: string;
    pendingDescription: string;
    approvedDescription: string;
    rejectedDescription: string;
    expiredDescription: string;
    adminNoteLabel: string;
  };
  form: {
    vehicleMakeLabel: string;
    vehicleModelLabel: string;
    vehiclePlateLabel: string;
    licenseNumberLabel: string;
    documentLabel: string;
    documentHint: string;
    submit: string;
    submitting: string;
    resubmit: string;
  };
  toasts: {
    missingFields: string;
    missingDocument: string;
    fileTooLarge: string;
    unsupportedFile: string;
    submitFailed: string;
    submitSuccess: string;
  };
};

type Verification = {
  status: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_plate: string;
  license_number: string;
  admin_note: string | null;
} | null;

type Props = {
  dict: Dict;
  verification: Verification;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024;

export default function DriverVerificationForm({
  dict,
  verification,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [vehicleMake, setVehicleMake] = useState(
    verification?.vehicle_make ?? ""
  );
  const [vehicleModel, setVehicleModel] = useState(
    verification?.vehicle_model ?? ""
  );
  const [vehiclePlate, setVehiclePlate] = useState(
    verification?.vehicle_plate ?? ""
  );
  const [licenseNumber, setLicenseNumber] = useState(
    verification?.license_number ?? ""
  );
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];

    if (!selected) {
      return;
    }

    if (!ALLOWED_TYPES.includes(selected.type)) {
      toast.error(dict.toasts.unsupportedFile);
      event.target.value = "";
      return;
    }

    if (selected.size > MAX_SIZE) {
      toast.error(dict.toasts.fileTooLarge);
      event.target.value = "";
      return;
    }

    setFile(selected);
  }

  async function handleSubmit() {
    if (
      !vehicleMake.trim() ||
      !vehicleModel.trim() ||
      !vehiclePlate.trim() ||
      !licenseNumber.trim()
    ) {
      toast.error(dict.toasts.missingFields);
      return;
    }

    if (!file) {
      toast.error(dict.toasts.missingDocument);
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const extension =
        file.type === "application/pdf"
          ? "pdf"
          : file.type === "image/png"
            ? "png"
            : "jpg";

      const filePath = `${user.id}/doc-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("driver-documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        toast.error(uploadError.message || dict.toasts.submitFailed);
        return;
      }

      const { error: upsertError } = await supabase
        .from("driver_verifications")
        .upsert(
          {
            user_id: user.id,
            vehicle_make: vehicleMake.trim(),
            vehicle_model: vehicleModel.trim(),
            vehicle_plate: vehiclePlate.trim(),
            license_number: licenseNumber.trim(),
            document_path: filePath,
            status: "pending",
            admin_note: null,
            reviewed_by: null,
            reviewed_at: null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (upsertError) {
        toast.error(upsertError.message || dict.toasts.submitFailed);
        return;
      }

      toast.success(dict.toasts.submitSuccess);
      setFile(null);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const status = verification?.status;

  return (
    <div className="space-y-6">
      {status && (
        <Card className="p-8">
          <div className="flex items-center gap-3">
            <StatusIcon status={status} />

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {dict.status[status as keyof Dict["status"]] ?? status}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {status === "pending" && dict.status.pendingDescription}
                {status === "approved" && dict.status.approvedDescription}
                {status === "rejected" && dict.status.rejectedDescription}
                {status === "expired" && dict.status.expiredDescription}
              </p>
            </div>
          </div>

          {verification?.admin_note && status === "rejected" && (
            <p className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <strong>{dict.status.adminNoteLabel}:</strong>{" "}
              {verification.admin_note}
            </p>
          )}
        </Card>
      )}

      {status !== "approved" && status !== "pending" && (
        <Card className="p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="vehicle-make">
                {dict.form.vehicleMakeLabel}
              </Label>

              <Input
                id="vehicle-make"
                value={vehicleMake}
                onChange={(e) => setVehicleMake(e.target.value)}
                disabled={submitting}
                maxLength={50}
                className="h-14 rounded-2xl"
              />
            </div>

            <div>
              <Label htmlFor="vehicle-model">
                {dict.form.vehicleModelLabel}
              </Label>

              <Input
                id="vehicle-model"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                disabled={submitting}
                maxLength={50}
                className="h-14 rounded-2xl"
              />
            </div>

            <div>
              <Label htmlFor="vehicle-plate">
                {dict.form.vehiclePlateLabel}
              </Label>

              <Input
                id="vehicle-plate"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                disabled={submitting}
                maxLength={20}
                className="h-14 rounded-2xl"
              />
            </div>

            <div>
              <Label htmlFor="license-number">
                {dict.form.licenseNumberLabel}
              </Label>

              <Input
                id="license-number"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                disabled={submitting}
                maxLength={30}
                className="h-14 rounded-2xl"
              />
            </div>
          </div>

          <div className="mt-6">
            <Label>
              {dict.form.documentLabel}
            </Label>

            <label
              htmlFor="verification-document"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-8 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
            >
              <Upload className="h-5 w-5" />
              {file ? file.name : dict.form.documentLabel}

              <input
                id="verification-document"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileChange}
                disabled={submitting}
                className="hidden"
              />
            </label>

            <p className="mt-2 text-xs text-muted-foreground">
              {dict.form.documentHint}
            </p>
          </div>

          <div className="mt-8 flex justify-end border-t border-border pt-6">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="h-12 bg-primary px-8 font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {dict.form.submitting}
                </>
              ) : status === "rejected" || status === "expired" ? (
                dict.form.resubmit
              ) : (
                dict.form.submit
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent">
        <BadgeCheck className="h-6 w-6 text-accent-foreground" />
      </div>
    );
  }

  if (status === "rejected" || status === "expired") {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="h-6 w-6 text-destructive" />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
      <Clock3 className="h-6 w-6 text-amber-600" />
    </div>
  );
}

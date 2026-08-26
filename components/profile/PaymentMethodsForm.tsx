"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createClient } from "@/lib/supabase/client";

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

type Profile = {
  id: string;
  payment_paypal_me: string | null;
  payment_revolut_me: string | null;
  payment_satispay_link: string | null;
};

type Dict = {
  title: string;
  description: string;
  paypalLabel: string;
  paypalPlaceholder: string;
  paypalHint: string;
  revolutLabel: string;
  revolutPlaceholder: string;
  revolutHint: string;
  satispayLabel: string;
  satispayPlaceholder: string;
  satispayHint: string;
  saving: string;
  saveButton: string;
  errors: {
    invalidUsername: string;
    invalidUrl: string;
    updateFailed: string;
  };
  success: {
    updated: string;
  };
};

type Props = {
  profile: Profile;
  dict: Dict;
};

export default function PaymentMethodsForm({
  profile,
  dict,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [paypalMe, setPaypalMe] = useState(
    profile.payment_paypal_me ?? ""
  );

  const [revolutMe, setRevolutMe] = useState(
    profile.payment_revolut_me ?? ""
  );

  const [satispayLink, setSatispayLink] = useState(
    profile.payment_satispay_link ?? ""
  );

  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (loading) {
      return;
    }

    const trimmedPaypal = paypalMe.trim();
    const trimmedRevolut = revolutMe.trim();
    const trimmedSatispay = satispayLink.trim();

    if (trimmedPaypal && !USERNAME_PATTERN.test(trimmedPaypal)) {
      toast.error(dict.errors.invalidUsername);
      return;
    }

    if (trimmedRevolut && !/^https:\/\/.+/.test(trimmedRevolut)) {
      toast.error(dict.errors.invalidUrl);
      return;
    }

    if (trimmedSatispay && !/^https:\/\/.+/.test(trimmedSatispay)) {
      toast.error(dict.errors.invalidUrl);
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        payment_paypal_me: trimmedPaypal || null,
        payment_revolut_me: trimmedRevolut || null,
        payment_satispay_link: trimmedSatispay || null,
      })
      .eq("id", profile.id);

    setLoading(false);

    if (error) {
      console.error(
        "Errore aggiornamento metodi di pagamento:",
        error
      );

      toast.error(dict.errors.updateFailed);

      return;
    }

    toast.success(dict.success.updated);

    router.refresh();
  }

  return (
    <Card className="p-8">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          {dict.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {dict.description}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label>{dict.paypalLabel}</Label>

          <Input
            value={paypalMe}
            onChange={(e) => setPaypalMe(e.target.value)}
            disabled={loading}
            placeholder={dict.paypalPlaceholder}
            className="h-14 rounded-2xl"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            {dict.paypalHint}
          </p>
        </div>

        <div>
          <Label>{dict.revolutLabel}</Label>

          <Input
            value={revolutMe}
            onChange={(e) => setRevolutMe(e.target.value)}
            disabled={loading}
            placeholder={dict.revolutPlaceholder}
            className="h-14 rounded-2xl"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            {dict.revolutHint}
          </p>
        </div>

        <div className="md:col-span-2">
          <Label>{dict.satispayLabel}</Label>

          <Input
            value={satispayLink}
            onChange={(e) => setSatispayLink(e.target.value)}
            disabled={loading}
            placeholder={dict.satispayPlaceholder}
            className="h-14 rounded-2xl"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            {dict.satispayHint}
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-end border-t border-border pt-6">
        <Button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="h-12 rounded-2xl bg-primary px-8 font-semibold hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
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
  );
}

import AdminEventForm from "@/components/admin/AdminEventForm";
import { getTranslations } from "@/lib/i18n";

export default async function NewEventPage() {
  const { dict } = await getTranslations();

  return (
    <main className="mx-auto max-w-5xl p-10">
      <AdminEventForm
        dict={dict.admin.eventForm}
        imageUploaderDict={dict.admin.imageUploader}
      />
    </main>
  );
}
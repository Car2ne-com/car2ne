import { getTranslations } from "@/lib/i18n";

export default async function Loading() {
  const { dict } = await getTranslations();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-primary/15 border-t-primary"
        role="status"
        aria-label={dict.layout.loading}
      />
    </div>
  );
}

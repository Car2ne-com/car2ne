import { Sparkles } from "lucide-react";

type Dict = {
  badge: string;
  greeting: string;
  subtitle: string;
};

type Props = {
  name: string;
  dict: Dict;
};

export default function DashboardHeader({ name, dict }: Props) {
  return (
    <section className="mb-12">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
        <Sparkles className="h-4 w-4" />
        {dict.badge}
      </span>

      <h1 className="mt-6 text-2xl font-bold text-foreground">
        {dict.greeting.replace("{name}", name)}
      </h1>

      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
        {dict.subtitle}
      </p>
    </section>
  );
}
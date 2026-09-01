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
      <h1 className="mt-6 text-2xl font-semibold text-foreground">
        {dict.greeting.replace("{name}", name)}
      </h1>

      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
        {dict.subtitle}
      </p>
    </section>
  );
}
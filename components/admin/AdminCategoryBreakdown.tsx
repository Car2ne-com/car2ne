import { Card } from "@/components/ui/card";

type Category = {
  label: string;
  count: number;
  color: string;
};

type Props = {
  title: string;
  subtitle: string;
  categories: Category[];
  emptyLabel: string;
};

/*
 * Conteggio per categoria (non una serie temporale, a differenza di
 * AdminTrendChart): barre orizzontali proporzionali al totale,
 * stesso stile "zero dipendenze" già in uso nel resto della sezione
 * admin.
 */
export default function AdminCategoryBreakdown({
  title,
  subtitle,
  categories,
  emptyLabel,
}: Props) {
  const total = categories.reduce(
    (sum, category) => sum + category.count,
    0
  );

  return (
    <Card className="p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>

        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {total === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="mt-6 space-y-4">
          {categories.map((category) => {
            const percentage =
              total > 0
                ? Math.round((category.count / total) * 100)
                : 0;

            return (
              <div key={category.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {category.label}
                  </span>

                  <span className="text-muted-foreground">
                    {category.count} ({percentage}%)
                  </span>
                </div>

                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

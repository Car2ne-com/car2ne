import { Card } from "@/components/ui/card";

type Point = {
  date: string;
  count: number;
};

type Props = {
  title: string;
  data: Point[];
  color?: string;
  last30DaysLabel: string;
};

/*
 * Grafico a barre statico in SVG puro: nessuna libreria di grafici
 * nel progetto, e per 30 punti/serie non ne serve una — coerente
 * con lo stile a dipendenze minime già in uso altrove.
 */
export default function AdminTrendChart({
  title,
  data,
  color = "#10b981",
  last30DaysLabel,
}: Props) {
  const width = 640;
  const height = 160;
  const paddingBottom = 24;
  const paddingTop = 8;

  const max = Math.max(1, ...data.map((point) => point.count));
  const barWidth = data.length > 0 ? width / data.length : width;

  const total = data.reduce((sum, point) => sum + point.count, 0);

  return (
    <Card className="p-6">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>

        <p className="text-sm text-muted-foreground">
          {total} <span className="text-muted-foreground/70">{last30DaysLabel}</span>
        </p>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 h-40 w-full"
        preserveAspectRatio="none"
      >
        {data.map((point, index) => {
          const barHeight =
            ((height - paddingBottom - paddingTop) * point.count) / max;

          const x = index * barWidth;
          const y = height - paddingBottom - barHeight;

          return (
            <rect
              key={point.date}
              x={x + barWidth * 0.15}
              y={y}
              width={barWidth * 0.7}
              height={Math.max(barHeight, point.count > 0 ? 2 : 0)}
              rx={2}
              fill={color}
              opacity={0.85}
            >
              <title>
                {point.date}: {point.count}
              </title>
            </rect>
          );
        })}

        <line
          x1={0}
          y1={height - paddingBottom}
          x2={width}
          y2={height - paddingBottom}
          stroke="#e2e8f0"
          strokeWidth={1}
        />
      </svg>

      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </Card>
  );
}

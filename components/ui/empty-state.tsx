import type { ReactNode } from "react";
import { SearchX, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description: string;
  icon?: LucideIcon;
  className?: string;
  children?: ReactNode;
};

function EmptyState({
  title,
  description,
  icon: Icon = SearchX,
  className,
  children,
}: Props) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/50 px-8 py-20 text-center",
        className
      )}
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent">
        <Icon className="h-10 w-10 text-accent-foreground" />
      </div>

      <h3 className="text-2xl font-bold text-foreground">{title}</h3>

      <p className="mt-3 max-w-md text-muted-foreground">{description}</p>

      {children}
    </div>
  );
}

export { EmptyState };

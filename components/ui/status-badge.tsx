import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        success: "bg-accent text-accent-foreground",
        neutral: "bg-secondary text-secondary-foreground",
        danger: "bg-destructive/10 text-destructive",
        warning: "bg-warning text-warning-foreground",
        info: "bg-info text-info-foreground",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

function StatusBadge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof statusBadgeVariants>) {
  return (
    <span
      data-slot="status-badge"
      className={cn(statusBadgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { StatusBadge, statusBadgeVariants };

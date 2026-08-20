import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

function Select({
  className,
  containerClassName,
  children,
  ...props
}: React.ComponentProps<"select"> & { containerClassName?: string }) {
  return (
    <div className={cn("relative", containerClassName)}>
      <select
        data-slot="select"
        className={cn(
          "flex h-11 w-full appearance-none rounded-xl border border-input bg-background px-3.5 pr-9 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export { Select };

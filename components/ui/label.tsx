import * as React from "react";

import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn("mb-2 block text-sm font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-error"
      className={cn("mt-1.5 text-xs font-medium text-destructive", className)}
      {...props}
    />
  );
}

export { Label, FieldError };

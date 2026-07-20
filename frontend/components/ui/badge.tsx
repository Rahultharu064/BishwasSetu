import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold w-fit whitespace-nowrap",
  {
    variants: {
      variant: {
        outline: "border-border bg-transparent text-muted-foreground",
        primary: "border-transparent bg-primary text-primary-foreground",
        skilled: "border-[#2f6690]/30 bg-[#2f6690]/10 text-[#2f6690] dark:text-[#8fc2e4]",
        soft: "border-transparent bg-accent text-accent-foreground",
        urgent: "border-transparent bg-accent-urgent text-accent-urgent-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

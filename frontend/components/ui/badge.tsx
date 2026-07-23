import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Trust badges never use gradient fills — solid color + icon only (ux.md §2.1)
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold leading-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground",
        soft: "bg-primary-soft text-primary",
        skilled: "border border-skilled/40 bg-skilled-soft text-skilled",
        outline: "border border-border bg-card text-muted-foreground",
        urgent: "bg-urgent text-urgent-foreground",
        urgentSoft: "bg-urgent-soft text-urgent",
        warning: "bg-warning-soft text-warning",
        neutral: "bg-secondary text-secondary-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        default: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: { variant: "soft", size: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

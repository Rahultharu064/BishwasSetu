import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-secondary text-secondary-foreground",
        success: "bg-success/12 text-success",
        warning: "bg-warning/18 text-warning-foreground",
        destructive: "bg-destructive/12 text-destructive",
        accent: "bg-accent/12 text-accent",
        gold: "bg-gold/18 text-gold-foreground",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

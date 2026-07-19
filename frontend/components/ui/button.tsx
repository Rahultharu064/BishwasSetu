import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[15px] font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95",
        urgent:
          "bg-accent-urgent text-accent-urgent-foreground hover:bg-accent-urgent/90 active:bg-accent-urgent/95",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-secondary",
        ghost: "bg-transparent text-foreground hover:bg-secondary",
        subtle: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-12 px-5 [&_svg]:size-5",
        sm: "h-9 px-4 text-sm [&_svg]:size-4",
        lg: "h-14 px-6 text-base [&_svg]:size-5",
        icon: "h-11 w-11 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

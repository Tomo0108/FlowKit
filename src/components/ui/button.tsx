import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "rounded-xl bg-primary text-primary-foreground shadow-[0_1px_2px_oklch(0.2_0.01_80/0.12)] hover:bg-primary/90 hover:shadow-[0_4px_12px_oklch(0.2_0.01_80/0.15)] active:scale-[0.99]",
        secondary:
          "rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "rounded-xl border border-border bg-card/80 hover:bg-accent hover:text-accent-foreground",
        ghost: "rounded-lg hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-6 text-[0.9375rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

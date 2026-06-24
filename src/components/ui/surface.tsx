import * as React from "react";
import { cn } from "@/lib/utils";

type SurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "glass" | "solid";
};

export function Surface({
  className,
  variant = "glass",
  ...props
}: SurfaceProps) {
  return (
    <div
      className={cn(
        variant === "glass" ? "surface" : "surface-solid",
        "p-6 sm:p-8",
        className,
      )}
      {...props}
    />
  );
}

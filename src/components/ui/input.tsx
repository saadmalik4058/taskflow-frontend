// components/ui/input.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg",
          "border border-line bg-surface text-ink",
          "px-3 py-2 text-sm",
          "placeholder:text-ink-muted",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          "focus-visible:border-brand",
          "disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-50",
          "hover:border-brand",
          "aria-[invalid=true]:border-[hsl(var(--color-destructive))]",
          "aria-[invalid=true]:focus-visible:ring-[hsl(var(--color-destructive))]",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
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
          "flex h-10 w-full rounded-lg",
          "border border-[hsl(var(--input-border))]",
          "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]",
          "px-3 py-2 text-sm",
          "placeholder:text-[hsl(var(--muted-foreground))]",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[hsl(var(--muted))]",
          "hover:border-[hsl(var(--input-border-focus))]",
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
// components/ui/textarea.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg",
          "border border-[hsl(var(--input-border))]",
          "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]",
          "px-3 py-2 text-sm",
          "placeholder:text-[hsl(var(--muted-foreground))]",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[hsl(var(--muted))]",
          "hover:border-[hsl(var(--input-border-focus))]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
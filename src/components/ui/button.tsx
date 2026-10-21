// components/ui/button.tsx
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const baseStyles = cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
      "active:scale-[0.98]",
      "aria-busy:opacity-75",
      "shadow-sm hover:shadow-md"
    );

    const variants = {
      default: cn(
        "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))]",
        "hover:bg-[hsl(var(--color-primary-hover))]",
        "shadow-sm shadow-[hsl(var(--color-primary))/0.2]",
        "h-10 px-4 py-2"
      ),
      destructive: cn(
        "bg-[hsl(var(--color-destructive))] text-[hsl(var(--color-destructive-foreground))]",
        "hover:bg-[hsl(var(--color-destructive-hover))]",
        "shadow-sm shadow-[hsl(var(--color-destructive))/0.2]",
        "h-10 px-4 py-2"
      ),
      success: cn(
        "bg-[hsl(var(--color-success))] text-[hsl(var(--color-success-foreground))]",
        "hover:bg-[hsl(var(--color-success))]/90",
        "shadow-sm shadow-[hsl(var(--color-success))/0.2]",
        "h-10 px-4 py-2"
      ),
      outline: cn(
        "border border-[hsl(var(--input-border))] bg-transparent",
        "hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
        "border-[hsl(var(--input-border))]",
        "h-10 px-4 py-2"
      ),
      secondary: cn(
        "bg-[hsl(var(--color-secondary))] text-[hsl(var(--color-secondary-foreground))]",
        "hover:bg-[hsl(var(--color-secondary-hover))]",
        "h-10 px-4 py-2"
      ),
      ghost: cn(
        "bg-transparent",
        "hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
        "h-10 px-4 py-2"
      ),
      link: cn(
        "text-[hsl(var(--color-primary))] underline-offset-4 hover:underline",
        "h-10 px-4 py-2"
      ),
    };

    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-9 px-3 text-xs",
      lg: "h-11 px-8 text-base",
      icon: "h-10 w-10",
    };

    const isLoading = loading || props["aria-busy"] === "true";

    return (
      <Comp
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children || "Loading..."}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button };
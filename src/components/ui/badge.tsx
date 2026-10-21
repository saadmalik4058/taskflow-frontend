// components/ui/badge.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"
    | "pending" | "in-progress" | "completed"
    | "low" | "medium" | "high";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 hover:scale-105";

  const variants = {
    default: "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))]",
    secondary: "bg-[hsl(var(--color-secondary))] text-[hsl(var(--color-secondary-foreground))]",
    destructive: "bg-[hsl(var(--color-destructive))] text-[hsl(var(--color-destructive-foreground))]",
    outline: "text-[hsl(var(--foreground))] border-[hsl(var(--border))] bg-transparent",
    success: "bg-[hsl(var(--color-success))] text-[hsl(var(--color-success-foreground))]",
    warning: "bg-[hsl(var(--color-warning))] text-[hsl(var(--color-warning-foreground))]",
    info: "bg-[hsl(var(--color-info))] text-[hsl(var(--color-info-foreground))]",

    // Status variants
    pending: "bg-[hsl(var(--status-pending-bg))] text-[hsl(var(--status-pending))]",
    "in-progress": "bg-[hsl(var(--status-in-progress-bg))] text-[hsl(var(--status-in-progress))]",
    completed: "bg-[hsl(var(--status-completed-bg))] text-[hsl(var(--status-completed))]",

    // Priority variants
    low: "bg-[hsl(var(--priority-low-bg))] text-[hsl(var(--priority-low))]",
    medium: "bg-[hsl(var(--priority-medium-bg))] text-[hsl(var(--priority-medium))]",
    high: "bg-[hsl(var(--priority-high-bg))] text-[hsl(var(--priority-high))]",
  };

  return (
    <div className={cn(base, variants[variant], className)} {...props} />
  );
}

export { Badge };
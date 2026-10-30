// components/auth/auth-shell.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { CheckSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-brand text-brand-foreground">
              <CheckSquare className="h-5 w-5" />
            </span>
            <span className="text-[21px] font-bold tracking-tight text-ink">
              Taskflow
            </span>
          </Link>
        </div>

        <Card className="w-full border-line bg-surface text-ink hover:shadow-[var(--shadow-sm)]">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
          {footer ? (
            <CardFooter className="justify-center border-t-0 pt-0">
              {footer}
            </CardFooter>
          ) : null}
        </Card>

        <p className="mt-6 text-center text-xs text-ink-muted">
          Plan projects, track tasks, and keep your work moving.
        </p>
      </div>
    </div>
  );
}

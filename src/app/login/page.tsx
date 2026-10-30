// app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getErrorMessage, getFieldErrorMap } from "@/lib/api/errors";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

function getNextPath(): string {
  const fallback = "/tasks";

  if (typeof window === "undefined") return fallback;

  const next = new URLSearchParams(window.location.search).get("next");
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/login") ||
    next.startsWith("/register")
  ) {
    return fallback;
  }

  return next;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("reason");
    setSessionExpired(reason === "session-expired");
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(getNextPath());
      router.refresh();
    }
  }, [authLoading, user, router]);

  const clearFieldError = (field: string) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      const nextFieldErrors = getFieldErrorMap(err);
      setFieldErrors(nextFieldErrors);
      setError(
        Object.keys(nextFieldErrors).length > 0
          ? "Please fix the highlighted fields."
          : getErrorMessage(err, "Unable to sign in. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue to your workspace."
      footer={
        <p className="text-sm text-ink-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-strong hover:underline"
          >
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {sessionExpired ? (
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-[hsl(var(--color-warning)/0.25)] bg-[hsl(var(--color-warning-light))] p-3 text-sm text-[hsl(var(--color-warning))]"
          >
            <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Your session expired. Please sign in again.</span>
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-[hsl(var(--color-destructive)/0.25)] bg-[hsl(var(--color-destructive-light))] p-3 text-sm text-[hsl(var(--color-destructive))]"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
            autoComplete="email"
            inputMode="email"
            disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email ? (
            <p
              id="email-error"
              role="alert"
              className="text-xs text-[hsl(var(--color-destructive))]"
            >
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearFieldError("password");
            }}
            autoComplete="current-password"
            disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "password-error" : undefined
            }
          />
          {fieldErrors.password ? (
            <p
              id="password-error"
              role="alert"
              className="text-xs text-[hsl(var(--color-destructive))]"
            >
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}

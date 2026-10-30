// app/register/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getErrorMessage, getFieldErrorMap } from "@/lib/api/errors";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, isLoading: authLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/tasks");
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
      await register(username, email, password);
    } catch (err) {
      const nextFieldErrors = getFieldErrorMap(err);
      setFieldErrors(nextFieldErrors);
      setError(
        Object.keys(nextFieldErrors).length > 0
          ? "Please fix the highlighted fields."
          : getErrorMessage(err, "Unable to create your account. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      description="Start organizing projects and tasks in one place."
      footer={
        <p className="text-sm text-ink-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-strong hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="johndoe"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              clearFieldError("username");
            }}
            autoComplete="username"
            minLength={3}
            maxLength={30}
            disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.username)}
            aria-describedby={
              fieldErrors.username ? "username-error" : "username-hint"
            }
          />
          {fieldErrors.username ? (
            <p
              id="username-error"
              role="alert"
              className="text-xs text-[hsl(var(--color-destructive))]"
            >
              {fieldErrors.username}
            </p>
          ) : (
            <p id="username-hint" className="text-xs text-ink-muted">
              3–30 characters. Letters, numbers and underscores only.
            </p>
          )}
        </div>

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
            placeholder="Create a password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearFieldError("password");
            }}
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "password-error" : "password-hint"
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
          ) : (
            <p id="password-hint" className="text-xs text-ink-muted">
              At least 8 characters.
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}

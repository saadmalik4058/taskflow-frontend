// components/layout/header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: "/tasks", label: "My Tasks" },
    { href: "/projects", label: "Projects" },
  ];

  if (isLoading) {
    return (
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/tasks" className="text-xl font-bold text-primary">
          Taskflow
        </Link>

        <nav className="flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors px-3 py-2 rounded-md",
                pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {user.username} ({user.role})
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
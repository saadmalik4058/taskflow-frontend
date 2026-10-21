// components/layout/header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckSquare, LogOut, User } from "lucide-react";

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: "/tasks", label: "My Tasks" },
    { href: "/projects", label: "Projects" },
  ];

  if (isLoading) {
    return (
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))/0.8] backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="h-8 w-32 bg-[hsl(var(--muted))] animate-pulse rounded-lg" />
          <div className="h-8 w-48 bg-[hsl(var(--muted))] animate-pulse rounded-lg" />
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))/0.8] backdrop-blur-lg sticky top-0 z-50 shadow-[var(--shadow-sm)]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/tasks" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-primary-hover))] shadow-md">
            <CheckSquare className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-primary-hover))] bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            Taskflow
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm font-medium transition-all px-3 py-2 rounded-lg",
                  isActive
                    ? "text-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary-light))]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="h-6 w-px bg-[hsl(var(--border))] mx-2" />

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))]/50">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-primary-hover))]">
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-medium leading-none">{user.username}</span>
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] leading-none mt-0.5 capitalize">{user.role}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
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
                <Button size="sm" className="bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-primary-hover))] hover:opacity-90">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
// components/layout/app-shell.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { projectsApi, type Project } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PROJECTS_CHANGED_EVENT } from "@/lib/project-events";
import { getProjectColor } from "@/lib/project-colors";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/tasks", label: "My Tasks", icon: ListChecks },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/completed", label: "Completed", icon: CheckCircle2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarContentProps {
  projects: Project[];
  projectsLoading: boolean;
  onNavigate?: () => void;
}

function SidebarContent({ projects, projectsLoading, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate?.();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[72px] shrink-0 items-center px-5">
        <Link
          href="/overview"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand text-brand-foreground">
            <CheckSquare className="h-[18px] w-[18px]" />
          </span>
          <span className="text-[19px] font-bold tracking-tight text-ink">Taskflow</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Main navigation">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-soft text-brand"
                    : "text-ink-muted hover:bg-canvas hover:text-ink"
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-7 px-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Projects
          </p>
        </div>

        <div className="mt-2 space-y-1">
          {projectsLoading ? (
            <div className="space-y-2 px-3 py-1">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-5 animate-pulse rounded-md bg-canvas" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="px-3 py-2 text-xs text-ink-muted">No projects yet</p>
          ) : (
            projects.map((project) => (
              <Link
                key={project._id}
                href={`/projects/${project._id}`}
                onClick={onNavigate}
                title={project.name}
                className="flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: getProjectColor(project._id) }}
                  aria-hidden="true"
                />
                <span className="truncate">{project.name}</span>
              </Link>
            ))
          )}
        </div>
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        {user ? (
          <div className="flex items-center gap-3 rounded-[10px] px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
              {getInitials(user.username || "U")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{user.username}</p>
              <p className="truncate text-xs capitalize text-ink-muted">{user.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-11 w-11 shrink-0 text-ink-muted hover:bg-canvas hover:text-ink"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Link
            href="/login"
            onClick={onNavigate}
            className="flex min-h-11 items-center justify-center rounded-[10px] bg-brand px-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-strong"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsRefreshKey, setProjectsRefreshKey] = useState(0);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    const handleProjectsChanged = () => {
      setProjectsRefreshKey((key) => key + 1);
    };

    window.addEventListener(PROJECTS_CHANGED_EVENT, handleProjectsChanged);
    return () => {
      window.removeEventListener(PROJECTS_CHANGED_EVENT, handleProjectsChanged);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isAuthPage || !user) {
      setProjects([]);
      setProjectsLoading(false);
      return;
    }

    let cancelled = false;
    setProjectsLoading(true);

    projectsApi
      .list()
      .then((data) => {
        if (!cancelled) setProjects(data.projects);
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      })
      .finally(() => {
        if (!cancelled) setProjectsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthPage, user, pathname, projectsRefreshKey]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] border-r border-line bg-surface lg:block">
        <SidebarContent projects={projects} projectsLoading={projectsLoading} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#14122B]/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation overlay"
          />
          <aside
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] border-r border-line bg-surface shadow-[var(--shadow-xl)]"
          >
            <div className="absolute right-3 top-4 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                className="h-11 w-11 text-ink-muted hover:bg-canvas hover:text-ink"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent
              projects={projects}
              projectsLoading={projectsLoading}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-[240px]">
        <div className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="h-11 w-11 text-ink-muted hover:bg-canvas hover:text-ink"
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link
            href="/overview"
            className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-brand text-brand-foreground">
              <CheckSquare className="h-4 w-4" />
            </span>
            <span className="text-[17px] font-bold tracking-tight text-ink">Taskflow</span>
          </Link>
        </div>

        <main className="mx-auto w-full max-w-[1440px] px-5 py-6 sm:px-7 sm:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}

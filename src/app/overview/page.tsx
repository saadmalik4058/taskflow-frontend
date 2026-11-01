"use client";

import { useAllTasks } from "@/hooks/use-all-tasks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useMemo } from "react";

export default function OverviewPage() {
  const { tasks, isLoading, error, note } = useAllTasks();

  if (isLoading) return <p>Loading…</p>;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error loading tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 inline-block text-brand-strong underline"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  // If we have a note about limited pages, show it at the top
  const noteElement = note
    ? <p className="mt-2 text-sm text-ink-muted">{note}</p>
    : null;

  // ---- stats computed from the full task list -----------------
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  // Overdue: due date before today (UTC) and not completed
  const todayDate = new Date();
  todayDate.setUTCHours(0, 0, 0, 0);
  const overdue = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate as string).setUTCHours(0, 0, 0, 0) < todayDate.getTime() &&
      t.status !== "completed"
  ).length;
  const pending = total - completed - inProgress - overdue;

  // ---- “Today” list: only tasks due today (date‑only, UTC) and not completed
  const todayTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate as string).setUTCHours(0, 0, 0, 0) ===
        todayDate.getTime() &&
      t.status !== "completed"
  );
  // Show at most 5
  const todayPreview = todayTasks.slice(0, 5);

  return (
    <>
      {noteElement}
      <h1 className="mb-6 text-3xl font-bold">Welcome back!</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Completion ring – simple text badge */}
        <Card>
          <CardHeader>
            <CardTitle>Completion</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {total ? Math.round((completed / total) * 100) : 0}%
          </CardContent>
        </Card>

        {/* To‑Do */}
        <Card>
          <CardHeader>
            <CardTitle>To‑Do</CardTitle>
          </CardHeader>
          <CardContent>{pending}</CardContent>
        </Card>

        {/* In‑Progress */}
        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
          </CardHeader>
          <CardContent>{inProgress}</CardContent>
        </Card>

        {/* Overdue */}
        <Card>
          <CardHeader>
            <CardTitle>Overdue</CardTitle>
          </CardHeader>
          <CardContent>{overdue}</CardContent>
        </Card>
      </div>

      {/* Today list */}
      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
        </CardHeader>
        <CardContent>
          {todayPreview.length ? (
            <ul className="space-y-1 text-sm">
              {todayPreview.map((t) => {
                const due = t.dueDate
                  ? ` (due ${new Date(t.dueDate as string).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}`
                  : "";
                return (
                  <li key={t._id}>
                    {t.title}{due}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-ink-muted">No tasks due today</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
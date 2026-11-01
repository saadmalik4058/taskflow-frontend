"use client";

import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useMemo } from "react";

export default function OverviewPage() {
  const { data: tasksResponse = [], isLoading } = useTasks();
  const tasks = Array.isArray(tasksResponse) ? tasksResponse : (tasksResponse?.tasks || []);

  if (isLoading) return <p>Loading…</p>;

  // ---- stats computed from the task list -----------------
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const overdue = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate as string) < new Date() &&
      t.status !== "completed"
  ).length;
  const pending = total - completed - inProgress - overdue;

  // ---- “Today” list (tasks due today or with no due date) ----------
  const today = tasks
    .filter(
      (t) =>
        (!t.dueDate || new Date(t.dueDate as string).toDateString() === new Date().toDateString()) &&
        t.status !== "completed"
    )
    .slice(0, 5); // show at most 5

  return (
    <>
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
          {today.length ? (
            <ul className="space-y-1 text-sm">
              {today.map((t) => {
                const title = t.title;
                const due = t.dueDate
                  ? ` (due ${new Date(t.dueDate as string).toLocaleDateString()})`
                  : "";
                return (
                  <li key={t._id}>
                    {title}{due}
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
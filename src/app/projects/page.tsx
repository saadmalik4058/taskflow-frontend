"use client";

import { useAllTasks, useProjects } from "@/hooks";
import { Project } from "@/types/api";
import { Card, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

export default function ProjectsPage() {
  const { tasks: allTasks, isLoading } = useAllTasks();
  const { data: projects = [], isLoading: pLoading } = useProjects();

  // If either loader is active, show a pending state
  if (isLoading || pLoading) return <p>Loading…</p>;

  // Build per‑project stats from the full task list
  const projectStats = useMemo(() => {
    const map = new Map<string, { total: number; done: number }>();
    projects.forEach((proj) => {
      map.set(proj._id, { total: 0, done: 0 });
    });
    allTasks.forEach((t) => {
      const pid = t.project;
      if (pid) {
        const entry = map.get(pid);
        if (entry) {
          entry.total++;
          if (t.status === "completed") entry.done++;
        }
      }
    });
    return map;
  }, [projects, allTasks]);

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">My Projects</h1>
      {projects.length === 0 ? (
        <p className="text-center text-ink-muted">No projects yet</p>
      ) : (
        <ul>
          {projects.map((proj) => {
            const stats = projectStats.get(proj._id) ?? { total: 0, done: 0 };
            const total = stats.total;
            const done = stats.done;
            const percent = total ? Math.round((done / total) * 100) : 0;
            return (
              <li key={proj._id} className="mb-3">
                <Card>
                  <CardTitle>{proj.name}</CardTitle>
                  <p>{done} of {total} done ({percent}%)</p>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
"use client";

import { useParams } from "next/navigation";
import { useAllTasks } from "@/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { tasks: allTasks } = useAllTasks();

  // Always compute the filtered task list, regardless of id
  const projectTasks = useMemo(() =>
    allTasks.filter((t) => t.project === id),
    [allTasks, id]
  );

  // If there is no route param, show a friendly message
  if (!id) {
    return <Card className="p-6"><CardTitle>Project ID missing</CardTitle></Card>;
  }

  // If the project has no tasks, show a friendly message
  if (projectTasks.length === 0) {
    return (
      <Card className="p-6">
        <CardTitle>No tasks for this project</CardTitle>
      </Card>
    );
  }

  const total = projectTasks.length;
  const done = projectTasks.filter((t) => t.status === "completed").length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>{id}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg">{total} tasks</p>
        <progress value={percent} max={100} aria-label={`Project ${id} progress`} />
        <p className="mt-2">
          {done} of {total} completed
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {projectTasks.map((t) => {
            const due = t.dueDate
              ? ` (due ${new Date(t.dueDate as string).toLocaleDateString()})`
              : "";
            return (
              <li key={t._id}>
                {t.title}{due}{" "}{t.status}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
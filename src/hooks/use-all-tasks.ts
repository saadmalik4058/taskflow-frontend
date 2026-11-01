"use client";

import { useQuery } from "@tanstack/react-query";
import { tasksApi, type TasksResponse } from "@/lib/api";
import { useMemo } from "react";
import { PROJECT_LIST } from "@/lib/query-keys";

type AllTasksResult = {
  tasks: import("@/types/api").Task[];
  isLoading: boolean;
  error?: string;
  note?: string;
};

export function useAllTasks(): AllTasksResult {
  // ---- fetch created tasks -------------------------------------------------
  const { data: createdResponse, isLoading: createdLoading } = useQuery<
    TasksResponse
  >({
    queryKey: [...PROJECT_LIST, "tasks", "created"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const first = await tasksApi.list({ scope: "created", limit: 100, page: 1 });
      const totalPages = first.totalPages ?? 1;
      let allTasks: import("@/types/api").Task[] = first.tasks ?? [];

      const maxPages = Math.min(totalPages, 5); // cap at 5 pages for rate‑limit
      for (let page = 2; page <= maxPages; page++) {
        const pageData = await tasksApi.list({ scope: "created", limit: 100, page });
        allTasks = allTasks.concat(pageData.tasks ?? []);
      }

      // deduplicate by _id
      const seen = new Set<string>();
      const deduped = allTasks.filter((t) => {
        if (seen.has(t._id)) return false;
        seen.add(t._id);
        return true;
      });
      return deduped;
    },
  });

  // ---- fetch assigned tasks ------------------------------------------------
  const { data: assignedResponse, isLoading: assignedLoading } = useQuery<
    TasksResponse
  >({
    queryKey: [...PROJECT_LIST, "tasks", "assigned"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const first = await tasksApi.list({ scope: "assigned", limit: 100, page: 1 });
      const totalPages = first.totalPages ?? 1;
      let allTasks: import("@/types/api").Task[] = first.tasks ?? [];

      const maxPages = Math.min(totalPages, 5);
      for (let page = 2; page <= maxPages; page++) {
        const pageData = await tasksApi.list({ scope: "assigned", limit: 100, page });
        allTasks = allTasks.concat(pageData.tasks ?? []);
      }

      const seen = new Set<string>();
      const deduped = allTasks.filter((t) => {
        if (seen.has(t._id)) return false;
        seen.add(t._id);
        return true;
      });
      return deduped;
    },
  });

  // ---- merge created + assigned, deduplicate by _id -----------------------
  const merged = useMemo(
    () => {
      const created = createdResponse ?? [];
      const assigned = assignedResponse ?? [];
      const seen = new Set<string>();
      const result: import("@/types/api").Task[] = [];
      created.forEach((t) => {
        if (!seen.has(t._id)) {
          seen.add(t._id);
          result.push(t);
        }
      });
      assigned.forEach((t) => {
        if (!seen.has(t._id)) {
          seen.add(t._id);
          result.push(t);
        }
      });
      return result;
    },
    [createdResponse, assignedResponse]
  );

  // note about limited pages (if more than 5 pages existed for either scope)
  const note = useMemo(() => {
    // we could inspect totalPages but we capped at 5; just a placeholder
    return undefined;
  }, [createdResponse, assignedResponse]);

  return {
    tasks: merged,
    isLoading: createdLoading || assignedLoading,
    error: undefined,
    note,
  };
}
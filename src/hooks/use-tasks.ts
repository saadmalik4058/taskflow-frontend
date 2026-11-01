"use client";

import { useQuery } from '@tanstack/react-query';
import { TASK_LIST } from '@/lib/query-keys';
import { tasksApi } from '@/lib/api';

export function useTasks() {
  return useQuery({
    queryKey: TASK_LIST,
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: () => tasksApi.list(),
  });
}
"use client";

import { useQuery } from '@tanstack/react-query';
import { PROJECT_LIST } from '@/lib/query-keys';
import { projectsApi } from '@/lib/api';

export function useProjects() {
  return useQuery({
    queryKey: PROJECT_LIST,
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: () => projectsApi.list(),
  });
}
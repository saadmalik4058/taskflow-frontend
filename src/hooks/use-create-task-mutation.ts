"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateTaskRequest, TaskStatus, TaskPriority } from '@/types/api';
import { tasksApi } from '@/lib/api';
import { TASK_LIST } from '@/lib/query-keys';

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_LIST });
    },
  });
}
"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateTaskRequest } from '@/types/api';
import { tasksApi } from '@/lib/api';
import { TASK_LIST } from '@/lib/query-keys';

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTaskRequest) => tasksApi.update('0', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_LIST });
    },
  });
}
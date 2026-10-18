// components/tasks/task-card.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, formatDate } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/api";
import { MoreHorizontal, Calendar, User } from "lucide-react";
import type { Task } from "@/types/api";

interface TaskCardProps {
  task: Task;
  isCreator: boolean;
  isAssignee: boolean;
  onEdit: (task: Task) => void;
  onUpdate: () => void;
}

export function TaskCard({ task, isCreator, isAssignee, onEdit, onUpdate }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const canEdit = isCreator || isAssignee;
  const canChangeStatus = isCreator || isAssignee;
  const canChangeOther = isCreator;

  const handleStatusChange = async (newStatus: string) => {
    try {
      // This would call the API, but for now we'll just refresh
      // In a real app, you'd call tasksApi.update(task._id, { status: newStatus })
      // For now, we'll rely on the parent to refresh
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const priorityVariant = (p: Task["priority"]) => {
    switch (p) {
      case "low": return "success";
      case "medium": return "warning";
      case "high": return "destructive";
      default: return "default";
    }
  };

  const statusVariant = (s: Task["status"]) => {
    switch (s) {
      case "pending": return "default";
      case "in-progress": return "info";
      case "completed": return "success";
      default: return "default";
    }
  };

  return (
    <Card className={cn("transition-shadow hover:shadow-md", !canEdit && "opacity-75")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{task.title}</CardTitle>
            {task.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={priorityVariant(task.priority)}>
              {PRIORITY_LABELS[task.priority] || task.priority}
            </Badge>
            <Badge variant={statusVariant(task.status)}>
              {STATUS_LABELS[task.status] || task.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Due: {formatDate(task.dueDate)}
            </span>
          )}
          {task.assignedTo && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              Assigned
            </span>
          )}
          <span className="flex items-center gap-1">
            Created: {formatDate(task.createdAt)}
          </span>
        </div>

        {canEdit && (
          <div className="mt-4 flex items-center justify-end gap-2">
            {canChangeStatus && (
              <Select
                value={task.status}
                onValueChange={handleStatusChange}
                disabled={!canChangeStatus}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            )}
            {canChangeOther && (
              <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                Edit
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
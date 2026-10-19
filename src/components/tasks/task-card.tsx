// components/tasks/task-card.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, formatDate } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/api";
import { MoreHorizontal, Calendar, User, Loader2 } from "lucide-react";
import type { Task } from "@/types/api";
import { tasksApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface TaskCardProps {
  task: Task;
  isCreator: boolean;
  isAssignee: boolean;
  onEdit: (task: Task) => void;
  onUpdate: () => void;
}

export function TaskCard({ task, isCreator, isAssignee, onEdit, onUpdate }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { toast } = useToast();

  const canEdit = isCreator || isAssignee;
  const canChangeStatus = isCreator || isAssignee;
  const canChangeOther = isCreator;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === task.status) return;
    
    setUpdatingStatus(true);
    try {
      await tasksApi.update(task._id, { status: newStatus as "pending" | "in-progress" | "completed" });
      toast({ variant: "success", title: "Status Updated", description: `Task marked as ${STATUS_LABELS[newStatus as keyof typeof STATUS_LABELS] || newStatus}` });
      onUpdate();
    } catch (err: unknown) {
      if (err instanceof Error && "status" in err) {
        const apiError = err as unknown as { data: { message: string } };
        toast({ variant: "destructive", title: "Failed to Update", description: apiError.data.message || "Failed to update status" });
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
      }
    } finally {
      setUpdatingStatus(false);
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
                disabled={!canChangeStatus || updatingStatus}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                  {updatingStatus && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
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
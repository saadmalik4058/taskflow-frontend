// components/tasks/task-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tasksApi, projectsApi, type CreateTaskRequest, type UpdateTaskRequest, type Task } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { cn, formatDate } from "@/lib/utils";
import { Loader2, AlertCircle } from "lucide-react";
import type { ListTasksQuery } from "@/types/api";

interface TaskFormProps {
  initialData?: Task | null;
  onSuccess: () => void;
  onClose: () => void;
}

export function TaskForm({ initialData, onSuccess, onClose }: TaskFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed">("pending");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [projects, setProjects] = useState<Array<{ _id: string; name: string }>>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setStatus(initialData.status);
      setPriority(initialData.priority);
      setDueDate(initialData.dueDate ? initialData.dueDate.split("T")[0] : "");
      setProjectId(initialData.project);
      setAssignedTo(initialData.assignedTo || "");
    }
    loadProjects();
  }, [initialData]);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.list();
      setProjects(data.projects);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload: CreateTaskRequest | UpdateTaskRequest = {
        title,
        description: description || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
        project: projectId,
        assignedTo: assignedTo || undefined,
      };

      if (isEditing) {
        await tasksApi.update(initialData!._id, payload);
      } else {
        await tasksApi.create(payload);
      }
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error && "status" in err) {
        const apiError = err as unknown as { status: number; data: { message: string; errors?: Array<{ field: string; message: string }> } };
        if (apiError.status === 400 && apiError.data.errors) {
          setError(apiError.data.errors.map((e) => `${e.field}: ${e.message}`).join(", "));
        } else {
          setError(apiError.data.message || "Failed to save task");
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description"
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as "pending" | "in-progress" | "completed")} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as "low" | "medium" | "high")} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project">Project *</Label>
        {projectsLoading ? (
          <Input placeholder="Loading projects..." disabled />
        ) : (
          <Select value={projectId} onValueChange={setProjectId} disabled={isLoading || projectsLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignedTo">Assigned To</Label>
        <Select value={assignedTo} onValueChange={setAssignedTo} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select assignee (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Unassigned</SelectItem>
            {projects.flatMap((p) => []).map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || projectsLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            isEditing ? "Update Task" : "Create Task"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
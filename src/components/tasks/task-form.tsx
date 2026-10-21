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
import { Loader2, CheckCircle2 } from "lucide-react";
import type { ListTasksQuery } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/ui/date-picker";

interface TaskFormProps {
  initialData?: Task | null;
  onSuccess: () => void;
  onClose: () => void;
}

interface FieldError {
  field: string;
  message: string;
}

export function TaskForm({ initialData, onSuccess, onClose }: TaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!initialData;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed">("pending");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [projects, setProjects] = useState<Array<{ _id: string; name: string }>>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

  const getFieldError = (field: string): string | undefined => {
    return fieldErrors.find((e) => e.field === field)?.message;
  };

  const hasFieldError = (field: string): boolean => {
    return fieldErrors.some((e) => e.field === field);
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => prev.filter((e) => e.field !== field));
  };

  const handleChange = (field: string, value: string) => {
    switch (field) {
      case "title":
        setTitle(value);
        break;
      case "description":
        setDescription(value);
        break;
      case "status":
        setStatus(value as "pending" | "in-progress" | "completed");
        break;
      case "priority":
        setPriority(value as "low" | "medium" | "high");
        break;
      case "dueDate":
        setDueDate(value);
        break;
      case "projectId":
        setProjectId(value);
        break;
      case "assignedTo":
        setAssignedTo(value);
        break;
    }
    // Clear field error on change
    if (hasFieldError(field)) {
      clearFieldError(field);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FieldError[] = [];

    if (!title.trim()) {
      newErrors.push({ field: "title", message: "Title is required" });
    } else if (title.length > 200) {
      newErrors.push({ field: "title", message: "Title must be at most 200 characters" });
    }

    if (!projectId) {
      newErrors.push({ field: "project", message: "Project is required" });
    }

    if (description.length > 2000) {
      newErrors.push({ field: "description", message: "Description must be at most 2000 characters" });
    }

    setFieldErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors([]);

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors below",
      });
      return;
    }

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
        toast({ variant: "success", title: "Task Updated", description: "Your changes have been saved" });
      } else {
        await tasksApi.create(payload);
        toast({ variant: "success", title: "Task Created", description: "Your new task has been created" });
      }
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error && "status" in err) {
        const apiError = err as unknown as { status: number; data: { message: string; errors?: Array<{ field: string; message: string }> } };
        if (apiError.status === 400 && apiError.data.errors) {
          setFieldErrors(apiError.data.errors);
          toast({ variant: "destructive", title: "Validation Error", description: apiError.data.errors.map((e) => `${e.field}: ${e.message}`).join(", ") });
        } else {
          toast({ variant: "destructive", title: "Error", description: apiError.data.message || "Failed to save task" });
        }
      } else {
        toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlurWrapper = (field: string) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    handleBlur(field);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => handleChange("title", e.target.value)}
          onBlur={handleBlurWrapper("title")}
          placeholder="Task title"
          required
          disabled={isLoading}
          aria-invalid={hasFieldError("title")}
          aria-describedby={hasFieldError("title") ? "title-error" : undefined}
        />
        {touched.title && hasFieldError("title") && (
          <p id="title-error" className="text-xs text-[hsl(var(--color-destructive))]" role="alert">
            {getFieldError("title")}
          </p>
        )}
        {touched.title && !hasFieldError("title") && title.trim() && (
          <p className="text-xs text-[hsl(var(--color-success))] flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Title looks good
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => handleChange("description", e.target.value)}
          onBlur={handleBlurWrapper("description")}
          placeholder="Task description"
          rows={3}
          disabled={isLoading}
          aria-invalid={hasFieldError("description")}
          aria-describedby={hasFieldError("description") ? "description-error" : undefined}
        />
        {touched.description && hasFieldError("description") && (
          <p id="description-error" className="text-xs text-[hsl(var(--color-destructive))]" role="alert">
            {getFieldError("description")}
          </p>
        )}
        {touched.description && !hasFieldError("description") && description.length > 0 && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {description.length}/2000 characters
          </p>
        )}
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
        <DatePicker
          id="dueDate"
          value={dueDate}
          onChange={(val) => handleChange("dueDate", val || "")}
          onBlur={handleBlurWrapper("dueDate")}
          disabled={isLoading}
          error={getFieldError("dueDate")}
          placeholder="Select due date"
        />
        {touched.dueDate && hasFieldError("dueDate") && (
          <p id="dueDate-error" className="text-xs text-[hsl(var(--color-destructive))]" role="alert">
            {getFieldError("dueDate")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="project">Project *</Label>
        {projectsLoading ? (
          <Input placeholder="Loading projects..." disabled />
        ) : (
          <Select value={projectId} onValueChange={(v) => handleChange("projectId", v)} disabled={isLoading || projectsLoading}>
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
        {touched.projectId && hasFieldError("project") && (
          <p id="project-error" className="text-xs text-[hsl(var(--color-destructive))]" role="alert">
            {getFieldError("project")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignedTo">Assigned To</Label>
        <Select value={assignedTo} onValueChange={(v) => handleChange("assignedTo", v)} disabled={isLoading}>
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

      <DialogFooter className="pt-4 border-t border-[hsl(var(--border))]">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || projectsLoading} loading={isLoading}>
          {isLoading ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
        </Button>
      </DialogFooter>
    </form>
  );
}
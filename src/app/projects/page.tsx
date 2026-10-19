// app/projects/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { projectsApi, type Project, type CreateProjectRequest, type UpdateProjectRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Loader2, Trash2, Edit, AlertCircle, CheckCircle2, LayoutGrid, List } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { ProjectListSkeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

interface FieldError {
  field: string;
  message: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await projectsApi.list();
      setProjects(data.projects);
    } catch (err: unknown) {
      if (err instanceof Error && "data" in err) {
        const apiError = err as unknown as { data: { message: string } };
        setError(apiError.data.message || "Failed to load projects");
      } else {
        setError("Failed to load projects");
      }
    } finally {
      setIsLoading(false);
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
      case "name":
        setName(value);
        break;
      case "description":
        setDescription(value);
        break;
    }
    if (hasFieldError(field)) {
      setFieldErrors((prev) => prev.filter((e) => e.field !== field));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FieldError[] = [];

    if (!name.trim()) {
      newErrors.push({ field: "name", message: "Project name is required" });
    } else if (name.length > 100) {
      newErrors.push({ field: "name", message: "Name must be at most 100 characters" });
    }

    if (description.length > 2000) {
      newErrors.push({ field: "description", message: "Description must be at most 2000 characters" });
    }

    setFieldErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleBlurWrapper = (field: string) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleBlur(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors([]);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name,
        description: description || undefined,
      };

      if (editingProject) {
        await projectsApi.update(editingProject._id, payload);
      } else {
        await projectsApi.create(payload as CreateProjectRequest);
      }
      fetchProjects();
      closeDialog();
    } catch (err: unknown) {
      if (err instanceof Error && "data" in err) {
        const apiError = err as unknown as { status: number; data: { message: string; errors?: Array<{ field: string; message: string }> } };
        if (apiError.status === 400 && apiError.data.errors) {
          setFieldErrors(apiError.data.errors);
          setError(apiError.data.errors.map((e) => `${e.field}: ${e.message}`).join(", "));
        } else {
          setError(apiError.data.message || "Failed to save project");
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete "${project.name}"? This will also delete all its tasks.`)) return;
    setDeleteLoading(true);
    try {
      await projectsApi.delete(project._id);
      fetchProjects();
    } catch (err: unknown) {
      if (err instanceof Error && "data" in err) {
        const apiError = err as { data: { message: string } };
        alert(apiError.data.message || "Failed to delete project");
      }
    } finally {
      setDeleteLoading(false);
      setDeletingProject(null);
    }
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setDescription(project.description || "");
    setShowCreateDialog(true);
  };

  const closeDialog = () => {
    setShowCreateDialog(false);
    setEditingProject(null);
    setName("");
    setDescription("");
    setError("");
    setFieldErrors([]);
    setTouched({});
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--color-primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Your projects and their tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            aria-label="List view"
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button onClick={() => { closeDialog(); setShowCreateDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {(error || fieldErrors.length > 0) && (
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--color-destructive))] bg-[hsl(var(--color-destructive)/0.1)] p-3 rounded-lg border border-[hsl(var(--color-destructive)/0.2)] animate-in slide-down">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error || fieldErrors.map((e) => e.message).join(", ")}</span>
        </div>
      )}

      {isLoading ? (
        <ProjectListSkeleton count={3} />
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium">No projects yet</h3>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">Create your first project to get started</p>
            <Button
              className="mt-4"
              onClick={() => { closeDialog(); setShowCreateDialog(true); }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project._id}>
                <CardHeader>
                  <CardTitle className="truncate">{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]">
                    <span>Created: {formatDate(project.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(project)}
                        aria-label="Edit project"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setDeletingProject(project)}
                        disabled={deleteLoading}
                        aria-label="Delete project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <Card key={project._id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] truncate mt-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))] flex-shrink-0">
                      <span>Created: {formatDate(project.createdAt)}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(project)}
                          aria-label="Edit project"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setDeletingProject(project)}
                          disabled={deleteLoading}
                          aria-label="Delete project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "Create Project"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-4" noValidate>
            {(error || fieldErrors.length > 0) && (
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--color-destructive))] bg-[hsl(var(--color-destructive)/0.1)] p-3 rounded-lg border border-[hsl(var(--color-destructive)/0.2)] animate-in slide-down">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error || fieldErrors.map((e) => e.message).join(", ")}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={handleBlurWrapper("name")}
                placeholder="Project name"
                required
                disabled={isLoading}
                aria-invalid={hasFieldError("name")}
                aria-describedby={hasFieldError("name") ? "name-error" : undefined}
              />
              {touched.name && hasFieldError("name") && (
                <p id="name-error" className="text-xs text-[hsl(var(--color-destructive))]" role="alert">
                  {getFieldError("name")}
                </p>
              )}
              {touched.name && !hasFieldError("name") && name.trim() && (
                <p className="text-xs text-[hsl(var(--color-success))] flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Name looks good
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
                placeholder="Project description"
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

            <DialogFooter className="pt-4 border-t border-[hsl(var(--border))]">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} loading={isLoading}>
                {isLoading ? "Saving..." : editingProject ? "Update Project" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingProject} onOpenChange={() => setDeletingProject(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete <strong>{deletingProject?.name}</strong>? This will
            also delete all tasks in this project. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingProject(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(deletingProject!)} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
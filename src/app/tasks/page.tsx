// app/tasks/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { tasksApi, type ListTasksQuery, type TaskScope } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskForm } from "@/components/tasks/task-form";
import { Pagination } from "@/components/ui/pagination";
import { cn, formatDate } from "@/lib/utils";
import { Plus, Search, Filter, Loader2, AlertCircle } from "lucide-react";

export default function TasksPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [scope, setScope] = useState<TaskScope>("created");
  const [query, setQuery] = useState<ListTasksQuery>({ scope: "created", page: 1, limit: 10 });
  const [tasksData, setTasksData] = useState<{ tasks: any[]; totalTasks: number; totalPages: number; currentPage: number; pageSize: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchTasks = async () => {
    if (!user) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await tasksApi.list({ ...query, scope });
      setTasksData(data);
    } catch (err: unknown) {
      if (err instanceof Error && "data" in err) {
        const apiError = err as unknown as { data: { message: string } };
        setError(apiError.data.message || "Failed to load tasks");
      } else {
        setError("Failed to load tasks");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [query, scope, user]);

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const handleScopeChange = (newScope: TaskScope) => {
    setScope(newScope);
    setQuery((prev) => ({ ...prev, scope: newScope, page: 1 }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const search = formData.get("search") as string;
    setQuery((prev) => ({ ...prev, search: search || undefined, page: 1 }));
  };

  const handleFilterChange = (key: keyof ListTasksQuery, value: string) => {
    setQuery((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const handleTaskUpdated = () => {
    setShowCreateDialog(false);
    setEditingTask(null);
    fetchTasks();
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            {scope === "created" ? "Tasks you created" : "Tasks assigned to you"}
          </p>
        </div>
        <Button onClick={() => { setEditingTask(null); setShowCreateDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Scope tabs + search + filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Scope tabs */}
            <div className="flex bg-gray-100 rounded-md p-1" role="tablist">
              {(["created", "assigned"] as TaskScope[]).map((s) => (
                <button
                  key={s}
                  role="tab"
                  aria-selected={scope === s}
                  onClick={() => handleScopeChange(s)}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    scope === s
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Search tasks..."
                  className="pl-10"
                  defaultValue={query.search}
                />
              </div>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={query.status || ""} onValueChange={(v) => handleFilterChange("status", v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={query.priority || ""} onValueChange={(v) => handleFilterChange("priority", v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              <Select value={query.sortBy || "createdAt"} onValueChange={(v) => handleFilterChange("sortBy", v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="updatedAt">Updated</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>

              <Select value={query.order || "desc"} onValueChange={(v) => handleFilterChange("order", v)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Desc</SelectItem>
                  <SelectItem value="asc">Asc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Tasks list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tasksData?.tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No tasks found</h3>
            <p className="text-muted-foreground mt-1">
              {scope === "created"
                ? "You haven't created any tasks yet."
                : "No tasks assigned to you yet."}
            </p>
            <Button
              className="mt-4"
              onClick={() => { setEditingTask(null); setShowCreateDialog(true); }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create your first task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasksData?.tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              isCreator={task.createdBy === user.id}
              isAssignee={task.assignedTo === user.id}
              onEdit={setEditingTask}
              onUpdate={handleTaskUpdated}
            />
          ))}

          {/* Pagination */}
          {tasksData && tasksData.totalPages > 1 && (
            <Pagination
              currentPage={tasksData.currentPage}
              totalPages={tasksData.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Create Task"}</DialogTitle>
          </DialogHeader>
          <TaskForm
            initialData={editingTask}
            onSuccess={handleTaskUpdated}
            onClose={() => { setShowCreateDialog(false); setEditingTask(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
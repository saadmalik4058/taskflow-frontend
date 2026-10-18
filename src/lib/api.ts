// lib/api.ts — Typed fetch wrappers for every backend endpoint
// All functions return typed data on success, throw typed errors on failure.

import {
  API_BASE_URL,
  type ApiErrorResponse,
  type ValidationErrorResponse,
  type SimpleErrorResponse,
  type RegisterRequest,
  type RegisterResponse,
  type LoginRequest,
  type LoginResponse,
  type ProfileResponse,
  type UsersResponse,
  type Project,
  type ProjectResponse,
  type ProjectsResponse,
  type CreateProjectRequest,
  type UpdateProjectRequest,
  type Task,
  type TaskResponse,
  type TasksResponse,
  type CreateTaskRequest,
  type UpdateTaskRequest,
  type ListTasksQuery,
  type TaskScope,
} from "@/types/api";

// Re-export types for convenience
export type {
  Project,
  Task,
  TaskStatus,
  TaskPriority,
  ListTasksQuery,
  TaskScope,
  RegisterRequest,
  LoginRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  RegisterResponse,
  LoginResponse,
  ProjectResponse,
  ProjectsResponse,
  TaskResponse,
  TasksResponse,
  ApiErrorResponse,
  ValidationErrorResponse,
  SimpleErrorResponse,
  UserProfile,
  UserPublic,
  PaginatedTasks,
} from "@/types/api";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly data: ApiErrorResponse,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    let data: ApiErrorResponse;
    try {
      data = await res.json();
    } catch {
      data = { message: res.statusText || "Unknown error" };
    }
    const message = "errors" in data
      ? data.errors.map((e) => `${e.field}: ${e.message}`).join(", ")
      : data.message;
    return new ApiError(res.status, data, message);
  }

  isValidationError(): this is ApiError & { data: ValidationErrorResponse } {
    return (
      typeof this.data === "object" &&
      this.data !== null &&
      "success" in this.data &&
      this.data.success === false &&
      "errors" in this.data
    );
  }

  getValidationErrors(): Array<{ field: string; message: string }> | null {
    if (this.isValidationError()) {
      return this.data.errors;
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------
async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw await ApiError.fromResponse(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const authApi = {
  register: (data: RegisterRequest) =>
    fetchApi<RegisterResponse>("/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: LoginRequest) =>
    fetchApi<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProfile: () => fetchApi<ProfileResponse>("/profile"),

  getUsers: () => fetchApi<UsersResponse>("/users"),
};

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export const projectsApi = {
  list: () => fetchApi<ProjectsResponse>("/projects"),

  get: (id: string) => fetchApi<ProjectResponse>(`/projects/${id}`),

  create: (data: CreateProjectRequest) =>
    fetchApi<ProjectResponse>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateProjectRequest) =>
    fetchApi<ProjectResponse>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<ProjectResponse>(`/projects/${id}`, {
      method: "DELETE",
    }),
};

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
export const tasksApi = {
  list: (query: ListTasksQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    return fetchApi<TasksResponse>(`/tasks?${params.toString()}`);
  },

  get: (id: string) => fetchApi<TaskResponse>(`/tasks/${id}`),

  create: (data: CreateTaskRequest) =>
    fetchApi<TaskResponse>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateTaskRequest) =>
    fetchApi<TaskResponse>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<TaskResponse>(`/tasks/${id}`, {
      method: "DELETE",
    }),
};

// ---------------------------------------------------------------------------
// Helpers for UI
// ---------------------------------------------------------------------------
export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};
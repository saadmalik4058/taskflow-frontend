// lib/api.ts — Typed fetch wrappers for every backend endpoint
// All functions return typed data on success, throw typed errors on failure.

import {
  type RegisterRequest,
  type RegisterResponse,
  type LoginRequest,
  type BffLoginResponse,
  type SessionResponse,
  type LogoutResponse,
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
import { ApiError, parseApiError } from "@/lib/api/errors";

export { ApiError } from "@/lib/api/errors";
export type {
  ApiFieldError,
  NormalizedApiErrorData,
} from "@/lib/api/errors";

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
  BffLoginResponse,
  SessionResponse,
  LogoutResponse,
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

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------
async function fetchJson<T>(
  url: string,
  options: RequestInit = {},
  redirectOn401 = true
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiError(0, {
      message:
        error instanceof Error
          ? error.message
          : "Network request failed. Please try again.",
    });
  }

  if (!response.ok) {
    const error = await parseApiError(response);

    if (error.status === 401 && redirectOn401 && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const alreadyOnExpiredLogin =
        window.location.pathname === "/login" &&
        params.get("reason") === "session-expired";

      if (!alreadyOnExpiredLogin) {
        const loginUrl = new URL("/login", window.location.origin);
        loginUrl.searchParams.set("reason", "session-expired");

        if (window.location.pathname !== "/login") {
          loginUrl.searchParams.set(
            "next",
            `${window.location.pathname}${window.location.search}`
          );
        }

        window.location.replace(loginUrl.toString());
      }
    }

    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  return fetchJson<T>(`/api/proxy${path}`, options);
}

function authFetch<T>(
  path: string,
  options: RequestInit = {},
  redirectOn401 = false
): Promise<T> {
  return fetchJson<T>(path, options, redirectOn401);
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const authApi = {
  register: (data: RegisterRequest) =>
    authFetch<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: LoginRequest) =>
    authFetch<BffLoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => authFetch<SessionResponse>("/api/auth/me", {}, true),

  logout: () =>
    authFetch<LogoutResponse>("/api/auth/logout", {
      method: "POST",
    }),

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
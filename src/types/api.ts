// types/api.ts — Single source of truth for API types
// Keep this in sync with your backend. If the API changes, update here first.

// ---------------------------------------------------------------------------
// Primitive aliases
// ---------------------------------------------------------------------------
export type ObjectId = string;        // 24-char hex string from MongoDB
export type ISODate = string;         // ISO 8601 date string

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------
export interface UserProfile {
  id: ObjectId;                // from JWT payload (named "id", not "_id")
  username: string;
  role: "user" | "admin";
  // email is NOT in the JWT payload; register returns it, login/profile do not
}

export interface UserPublic {
  _id: ObjectId;
  username: string;
  email: string;
  role: "user" | "admin";
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------
export interface Project {
  _id: ObjectId;
  name: string;
  description: string | null;
  createdBy: ObjectId;         // ObjectId string, NOT populated
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ---------------------------------------------------------------------------
// Task
// ---------------------------------------------------------------------------
export type TaskStatus = "pending" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  _id: ObjectId;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: ISODate | null;
  project: ObjectId;           // ObjectId string, NOT populated
  createdBy: ObjectId;         // ObjectId string, NOT populated
  assignedTo: ObjectId | null; // ObjectId string or null, NOT populated
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ---------------------------------------------------------------------------
// Paginated list (used by GET /tasks)
// ---------------------------------------------------------------------------
export interface PaginatedTasks {
  totalTasks: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  tasks: Task[];
}

// ---------------------------------------------------------------------------
// Request bodies (what YOU send)
// ---------------------------------------------------------------------------
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;            // min 8 chars enforced by validator
}

export interface LoginRequest {
  email: string;
  password: string;            // no length check on login (legacy accounts)
}

export interface CreateProjectRequest {
  name: string;                // required, trimmed, min 1
  description?: string;        // optional, trimmed, max 2000
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface CreateTaskRequest {
  title: string;               // required, trimmed, 1-200 chars
  description?: string;        // optional, trimmed, max 2000
  status?: TaskStatus;         // defaults to "pending"
  priority?: TaskPriority;     // defaults to "medium"
  dueDate?: string;            // ISO date string, validated by z.coerce.date()
  project: ObjectId;           // required, valid MongoDB ID
  assignedTo?: ObjectId;       // optional, valid MongoDB ID
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignedTo?: ObjectId | null; // null = unassign
}

// Query params for GET /tasks
export interface ListTasksQuery {
  scope?: "created" | "assigned"; // defaults to "created"
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;              // plain text, regex-escaped server-side
  page?: number;                // >= 1, default 1
  limit?: number;               // 1-100, default 10
  sortBy?: "createdAt" | "updatedAt" | "title" | "dueDate" | "priority";
  order?: "asc" | "desc";       // default "desc"
}

// ---------------------------------------------------------------------------
// Success responses (what the API returns on 2xx)
// ---------------------------------------------------------------------------
export interface RegisterResponse {
  message: string;
  user: {
    id: ObjectId;
    username: string;
    email: string;
    role: "user" | "admin";
  };
}

export interface LoginResponse {
  message: string;
  token: string;               // JWT, 1h expiry, payload = { id, username, role }
}

export interface ProfileResponse {
  message: string;
  user: UserProfile;
}

export interface UsersResponse {
  users: UserPublic[];
}

export interface ProjectResponse {
  message: string;
  project: Project;
}

export interface ProjectsResponse {
  projects: Project[];
}

export interface TaskResponse {
  message: string;
  task: Task;
}

export interface TasksResponse {
  totalTasks: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  tasks: Task[];
}

export interface TaskListResponse extends TasksResponse {}

// ---------------------------------------------------------------------------
// Error responses (what the API returns on 4xx/5xx)
// ---------------------------------------------------------------------------
// Validation errors (400 from Zod) — always this shape:
export interface ValidationErrorResponse {
  success: false;
  message: string;
  errors: Array<{
    field: string;             // e.g. "title", "email", "project"
    message: string;           // human-readable
  }>;
}

// Auth / permission / not-found errors (401, 403, 404) — just a message:
export interface SimpleErrorResponse {
  message: string;
}

// Union for any error you might receive
export type ApiErrorResponse = ValidationErrorResponse | SimpleErrorResponse;

// ---------------------------------------------------------------------------
// Type guard helpers
// ---------------------------------------------------------------------------
export function isValidationError(err: unknown): err is ValidationErrorResponse {
  return (
    typeof err === "object" &&
    err !== null &&
    "success" in err &&
    (err as Record<string, unknown>).success === false &&
    "errors" in err &&
    Array.isArray((err as ValidationErrorResponse).errors)
  );
}

// ---------------------------------------------------------------------------
// Scope enum for the UI tabs
// ---------------------------------------------------------------------------
export type TaskScope = "created" | "assigned";

// ---------------------------------------------------------------------------
// API base URL
// ---------------------------------------------------------------------------
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
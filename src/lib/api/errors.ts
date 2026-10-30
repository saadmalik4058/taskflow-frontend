// lib/api/errors.ts
// Normalizes both backend error shapes:
//   { message }
//   { success: false, message, errors: [{ field, message }] }

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface NormalizedApiErrorData {
  success?: false;
  message: string;
  errors?: ApiFieldError[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeErrorPayload(
  payload: unknown,
  fallbackMessage: string
): NormalizedApiErrorData {
  if (typeof payload === "string" && payload.trim()) {
    return { message: payload.trim() };
  }

  if (!isRecord(payload)) {
    return { message: fallbackMessage };
  }

  const message =
    typeof payload.message === "string" && payload.message.trim()
      ? payload.message
      : fallbackMessage;

  const errors = Array.isArray(payload.errors)
    ? payload.errors.flatMap((item) => {
        if (!isRecord(item)) return [];
        if (typeof item.field !== "string" || typeof item.message !== "string") {
          return [];
        }
        return [{ field: item.field, message: item.message }];
      })
    : [];

  return {
    success: false,
    message,
    ...(errors.length > 0 ? { errors } : {}),
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly data: NormalizedApiErrorData;

  constructor(status: number, data: NormalizedApiErrorData) {
    super(data.message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }

  get fieldErrors(): ApiFieldError[] {
    return this.data.errors ?? [];
  }

  getValidationErrors(): ApiFieldError[] | null {
    return this.data.errors ?? null;
  }

  isValidationError(): boolean {
    return this instanceof ValidationError;
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    return parseApiError(response);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(data: NormalizedApiErrorData) {
    super(401, data);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(data: NormalizedApiErrorData) {
    super(403, data);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends ApiError {
  constructor(data: NormalizedApiErrorData, status = 400) {
    super(status, data);
    this.name = "ValidationError";
  }
}

export class RateLimitError extends ApiError {
  constructor(data: NormalizedApiErrorData) {
    super(429, data);
    this.name = "RateLimitError";
  }
}

export class ServerError extends ApiError {
  constructor(data: NormalizedApiErrorData, status = 500) {
    super(status, data);
    this.name = "ServerError";
  }
}

export function createApiError(
  status: number,
  payload: unknown,
  fallbackMessage: string
): ApiError {
  const data = normalizeErrorPayload(payload, fallbackMessage);

  if (status === 401) return new UnauthorizedError(data);
  if (status === 403) return new ForbiddenError(data);
  if ((status === 400 || status === 422) && data.errors?.length) {
    return new ValidationError(data, status);
  }
  if (status === 429) return new RateLimitError(data);
  if (status >= 500) return new ServerError(data, status);

  return new ApiError(status, data);
}

export async function parseApiError(response: Response): Promise<ApiError> {
  const fallbackMessage =
    response.statusText || `Request failed with status ${response.status}`;

  let payload: unknown;

  try {
    const text = await response.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }
  } catch {
    payload = undefined;
  }

  return createApiError(response.status, payload, fallbackMessage);
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again."
): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallbackMessage;
}

export function getFieldErrorMap(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};

  return Object.fromEntries(
    error.fieldErrors.map(({ field, message }) => [field, message])
  );
}

// lib/server/backend.ts
// Server-only helper for talking to the Express API.

const API_BASE_URL = (
  process.env.API_BASE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export function getBackendUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function backendFetch(
  path: string,
  init: RequestInit = {},
  token?: string
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");

  if (init.body !== undefined && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  return fetch(getBackendUrl(path), {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function readJsonBody(response: Response): Promise<unknown> {
  try {
    const text = await response.text();
    if (!text) {
      return { message: response.statusText || "Request failed" };
    }

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  } catch {
    return { message: response.statusText || "Request failed" };
  }
}

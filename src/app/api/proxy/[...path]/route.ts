// app/api/proxy/[...path]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { backendFetch } from "@/lib/server/backend";
import {
  clearAuthCookie,
  getAuthToken,
  rejectInvalidOrigin,
} from "@/lib/server/auth";

const ALLOWED_ROOTS = new Set(["projects", "tasks", "users"]);
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;

  const invalidPath =
    !path?.length ||
    !ALLOWED_ROOTS.has(path[0]) ||
    path.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        segment.includes("/") ||
        segment.includes("\\")
    );

  if (invalidPath) {
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  }

  if (MUTATING_METHODS.has(request.method)) {
    const originError = rejectInvalidOrigin(request);
    if (originError) return originError;
  }

  const token = getAuthToken(request);
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  const search = new URL(request.url).search;
  const targetPath = `/${path.join("/")}${search}`;

  let body: string | undefined;
  if (MUTATING_METHODS.has(request.method)) {
    const text = await request.text();
    body = text.length > 0 ? text : undefined;
  }

  try {
    const backendResponse = await backendFetch(
      targetPath,
      { method: request.method, body },
      token
    );
    const responseBody = await backendResponse.text();
    const headers = new Headers();

    const contentType = backendResponse.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);

    const retryAfter = backendResponse.headers.get("retry-after");
    if (retryAfter) headers.set("retry-after", retryAfter);

    const response = new NextResponse(responseBody || null, {
      status: backendResponse.status,
      headers,
    });

    if (backendResponse.status === 401) {
      clearAuthCookie(response);
    }

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to reach the API server" },
      { status: 502 }
    );
  }
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
};

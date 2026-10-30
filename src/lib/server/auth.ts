// lib/server/auth.ts
import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
} from "@/lib/auth-cookie";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function getAuthToken(request: NextRequest): string | null {
  return request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    ...cookieOptions,
    name: AUTH_COOKIE_NAME,
    value: token,
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    ...cookieOptions,
    name: AUTH_COOKIE_NAME,
    value: "",
    maxAge: 0,
    expires: new Date(0),
  });
}

export function hasValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");

  // Some same-origin browser mutations omit Origin. Sec-Fetch-Site still
  // distinguishes them from cross-site requests. Non-browser requests with
  // neither header are rejected.
  if (!origin) {
    return request.headers.get("sec-fetch-site") === "same-origin";
  }

  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

export function rejectInvalidOrigin(request: NextRequest): NextResponse | null {
  if (hasValidOrigin(request)) return null;

  return NextResponse.json(
    { success: false, message: "Invalid request origin" },
    { status: 403 }
  );
}

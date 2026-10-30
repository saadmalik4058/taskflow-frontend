// app/api/auth/login/route.ts
import { NextResponse, type NextRequest } from "next/server";
import type { ProfileResponse } from "@/types/api";
import { backendFetch, readJsonBody } from "@/lib/server/backend";
import { rejectInvalidOrigin, setAuthCookie } from "@/lib/server/auth";

export async function POST(request: NextRequest) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  try {
    const loginResponse = await backendFetch("/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const loginData = await readJsonBody(loginResponse);

    if (!loginResponse.ok) {
      return NextResponse.json(loginData, { status: loginResponse.status });
    }

    const token =
      typeof loginData === "object" &&
      loginData !== null &&
      "token" in loginData &&
      typeof loginData.token === "string"
        ? loginData.token
        : null;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Login response did not include a token" },
        { status: 502 }
      );
    }

    const profileResponse = await backendFetch("/profile", {}, token);
    const profileData = await readJsonBody(profileResponse);

    if (!profileResponse.ok) {
      return NextResponse.json(profileData, { status: profileResponse.status });
    }

    const response = NextResponse.json({
      user: (profileData as ProfileResponse).user,
    });
    setAuthCookie(response, token);
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to reach the API server" },
      { status: 502 }
    );
  }
}

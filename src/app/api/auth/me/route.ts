// app/api/auth/me/route.ts
import { NextResponse, type NextRequest } from "next/server";
import type { ProfileResponse } from "@/types/api";
import { backendFetch, readJsonBody } from "@/lib/server/backend";
import { clearAuthCookie, getAuthToken } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const token = getAuthToken(request);

  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    const profileResponse = await backendFetch("/profile", {}, token);
    const profileData = await readJsonBody(profileResponse);

    if (profileResponse.status === 401) {
      const response = NextResponse.json(profileData, { status: 401 });
      clearAuthCookie(response);
      return response;
    }

    if (!profileResponse.ok) {
      return NextResponse.json(profileData, { status: profileResponse.status });
    }

    return NextResponse.json({
      user: (profileData as ProfileResponse).user,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to reach the API server" },
      { status: 502 }
    );
  }
}

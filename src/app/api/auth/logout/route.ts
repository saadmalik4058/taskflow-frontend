// app/api/auth/logout/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { clearAuthCookie, rejectInvalidOrigin } from "@/lib/server/auth";

export async function POST(request: NextRequest) {
  const originError = rejectInvalidOrigin(request);
  if (originError) return originError;

  const response = NextResponse.json({ message: "Logged out" });
  clearAuthCookie(response);
  return response;
}

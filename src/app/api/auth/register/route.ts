// app/api/auth/register/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { backendFetch, readJsonBody } from "@/lib/server/backend";
import { rejectInvalidOrigin } from "@/lib/server/auth";

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
    const registerResponse = await backendFetch("/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await readJsonBody(registerResponse);

    return NextResponse.json(data, { status: registerResponse.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to reach the API server" },
      { status: 502 }
    );
  }
}

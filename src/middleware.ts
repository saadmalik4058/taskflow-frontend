// middleware.ts — shared cookie-presence guard
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  if (request.nextUrl.pathname !== "/") {
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );
  }

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/",
    "/overview/:path*",
    "/tasks/:path*",
    "/projects/:path*",
    "/calendar/:path*",
    "/completed/:path*",
    "/settings/:path*",
  ],
};

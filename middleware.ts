 import { NextResponse } from "next/server";
  import type { NextRequest } from "next/server";

  // runs on every request before it reaches the page
  export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    // if visiting dashboard without a token → redirect to login
    if (pathname.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // if already logged in and visiting login/register → redirect to dashboard
    if ((pathname === "/login" || pathname === "/register") && token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
  };
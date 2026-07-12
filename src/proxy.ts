import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  const isPublicRoute = req.nextUrl.pathname === "/";

  // Allow API routes to handle their own auth
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/chat", req.nextUrl));
  }

  // Redirect non-logged-in users to login
  if (!isLoggedIn && !isAuthPage && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

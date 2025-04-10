import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public routes that don't need authentication
  const publicPaths = ["/", "/login", "/register"];

  // Define paths that need specific roles
  const moderatorPaths = ["/dashboard/moderation"];
  const adminPaths = ["/dashboard/admin"];

  // Check if the path is public or a PWA-related file
  const isPwaFile =
    path === "/manifest.json" ||
    path === "/sw.js" ||
    path === "/register-sw.js" ||
    path === "/offline.html" ||
    path.startsWith("/images/icon-") ||
    path.startsWith("/icons/");

  // Check if the path is public
  const isPublicPath =
    publicPaths.includes(path) ||
    path.startsWith("/api/auth") ||
    path.includes("favicon") ||
    path.includes("_next") ||
    isPwaFile; // Add PWA files to public paths

  // Also exclude the registration API route
  const isApiPublicPath = path.startsWith("/api/user/register");

  // Get token from session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // For public paths
  if (isPublicPath || isApiPublicPath) {
    // For logged-in users attempting to access login/register pages, redirect to dashboard
    if ((path === "/login" || path === "/register") && token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // For protected paths - If no token and path is not public, redirect to login
  if (!token) {
    // Store the original URL to redirect back after login
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(url);
  }

  // Check for role-specific paths
  if (
    moderatorPaths.some((p) => path.startsWith(p)) &&
    token.role !== "moderator" &&
    token.role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (adminPaths.some((p) => path.startsWith(p)) && token.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public routes that don't need authentication
  const publicPaths = ["/", "/login", "/register", "/api/auth/nextauth"];

  // Define paths that need specific roles
  const moderatorPaths = ["/dashboard/moderation"];

  const adminPaths = ["/dashboard/admin"];

  // Check if the path is public
  const isPublicPath = publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith("/api/auth/")
  );

  // Also exclude the registration API route
  const isApiPublicPath = path.startsWith("/api/user/register");

  if (isPublicPath || isApiPublicPath) {
    // For logged-in users attempting to access login/register pages, redirect to dashboard
    if (
      (path === "/login" || path === "/register") &&
      (await getToken({ req: request }))
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Get token from session
  const token = await getToken({ req: request });

  // If no token and path is not public, redirect to login
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Check for role-specific paths
  if (
    moderatorPaths.some((p) => path.startsWith(p)) &&
    token.role !== "moderator" &&
    token.role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (adminPaths.some((p) => path.startsWith(p)) && token.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude Next.js assets and API registration routes from middleware
    "/((?!api/user/register|api/socket|_next/static|_next/image|favicon.ico).*)",
  ],
};

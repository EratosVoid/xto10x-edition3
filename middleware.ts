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

  if (isPublicPath) {
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
  matcher: ["/((?!api/socket|_next/static|_next/image|favicon.ico).*)"],
};

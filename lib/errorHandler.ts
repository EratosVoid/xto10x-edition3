/**
 * Client-side error logging utility
 */

// Report auth-related errors to the server
export async function reportAuthError(error: any, context?: any) {
  console.error("Auth error:", error);

  // Only send to server in production
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    try {
      await fetch("/api/error", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: {
            message: error?.message || String(error),
            stack: error?.stack,
          },
          context: {
            ...context,
            location: window.location.href,
            type: "auth",
          },
        }),
      });
    } catch (e) {
      // If reporting fails, log locally
      console.error("Failed to report error:", e);
    }
  }
}

// Handle NextAuth session errors
export function handleSessionError(error: Error) {
  reportAuthError(error, { handler: "session" });

  // Return null session on error to prevent app from crashing
  return null;
}

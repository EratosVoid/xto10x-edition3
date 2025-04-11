"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";

interface SessionProviderProps {
  children: ReactNode;
}

export default function SessionProvider({ children }: SessionProviderProps) {
  // Set up global error handler for auth
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Check if error is related to auth
      if (
        event.message.includes("auth") ||
        event.message.includes("session") ||
        event.message.includes("CSRF")
      ) {
        console.error("Auth error detected:", event.error);
        // You could report to a logging service here
      }
    };

    window.addEventListener("error", handleError);

    return () => window.removeEventListener("error", handleError);
  }, []);

  return (
    <NextAuthSessionProvider
      // Refetch session every 5 minutes to keep it fresh
      refetchInterval={5 * 60}
      // When window is focused, refetch if it's been 1 minute since last fetch
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      {children}
    </NextAuthSessionProvider>
  );
}

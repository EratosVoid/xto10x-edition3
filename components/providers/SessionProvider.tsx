"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface SessionProviderProps {
  children: ReactNode;
}

export default function SessionProvider({ children }: SessionProviderProps) {
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

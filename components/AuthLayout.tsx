"use client";

import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/Sidebar";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-screen">
      {isAuthenticated && <Sidebar />}
      <main className="flex flex-col h-screen w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

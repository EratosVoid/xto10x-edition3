import NextAuth from "next-auth";

import authOptions from "@/lib/auth";

// Log any initialization errors to help with debugging in production
try {
  console.log("Initializing NextAuth handler with options:", {
    providers: authOptions.providers.map((p) => p.id),
    session: authOptions.session,
    pages: authOptions.pages,
    callbacks: Object.keys(authOptions.callbacks || {}),
    debug: authOptions.debug,
  });

  if (!process.env.NEXTAUTH_SECRET) {
    console.warn(
      "Warning: NEXTAUTH_SECRET is not defined. This is required for production.",
    );
  }
} catch (error) {
  console.error("Failed to initialize NextAuth:", error);
}

// Create the handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import connectDB from "./db/connect";
import UserModel from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connectDB();

          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const user = await UserModel.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("No user found with this email");
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password!
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          // Return user data without sensitive information
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image || "",
            role: user.role || "user",
            locality: user.locality || "",
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        // Initialize token with user data on first sign in
        token.id = user.id;
        token.role = user.role;
        token.locality = user.locality;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user && token) {
        // Add properties to session from token
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.locality = token.locality as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  // Ensure JWT is correctly configured
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export default authOptions;

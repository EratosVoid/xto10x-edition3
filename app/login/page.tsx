"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

// Create a client component to use useSearchParams
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isRegistered = searchParams.get("registered") === "true";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const voterId = formData.get("voterId") as string;
    const password = formData.get("password") as string;

    try {
      console.log("Attempting sign in with credentials");
      const result = await signIn("credentials", {
        redirect: false,
        voterId: voterId,
        password: password,
        callbackUrl,
      });

      console.log("Sign in result:", {
        ok: result?.ok,
        error: result?.error,
        status: result?.status,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push(callbackUrl);
      } else {
        setError("An unknown error occurred during sign in");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred while logging in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/30">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 p-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              LV
            </div>
            <span className="font-bold text-lg">LocalVoice</span>
          </Link>
        </div>
      </nav>

      <Card className="w-full max-w-md shadow-lg border dark:border-gray-700">
        <CardHeader className="flex flex-col gap-2 items-center bg-primary/5 rounded-t-xl p-6">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-default-500">Sign in to your account</p>
          {isRegistered && (
            <div className="bg-green-50 p-3 rounded-md text-green-700 text-sm my-2 w-full text-center">
              Account created successfully! Please sign in.
            </div>
          )}
        </CardHeader>

        <CardBody className="p-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="voterId"
              >
                Voter ID
              </label>
                <Input
                  fullWidth
                  required
                  id="voterId"
                  name="voterId"
                  placeholder="Voter ID"
                  type="text"
                  className="border-gray-300 focus:border-primary"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <Input
                  fullWidth
                  required
                  autoComplete="current-password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  type="password"
                  className="border-gray-300 focus:border-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    href="#"
                    className="font-medium text-primary hover:text-primary-400"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </div>

            <Button
              fullWidth
              color="primary"
              disabled={isLoading}
              isLoading={isLoading}
              type="submit"
              className="py-6"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardBody>

        <CardFooter className="flex justify-center p-6 bg-gray-50 dark:bg-gray-800/40 rounded-b-xl border-t dark:border-gray-700">
          <div className="text-sm text-center">
            Don&apos;t have an account?{" "}
            <Link
              className="font-medium text-primary hover:text-primary-400"
              href="/register"
            >
              Sign up now
            </Link>
          </div>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-default-500 hover:text-primary">
          ← Back to homepage
        </Link>
      </div>
    </div>
  );
}

// Fallback component while suspense is loading
function LoginFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/30">
      <Card className="w-full max-w-md">
        <CardBody className="py-8">
          <div className="text-center">Loading login page...</div>
        </CardBody>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

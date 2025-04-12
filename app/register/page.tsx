"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

// List of localities for the select input
const localities = [
  { value: "North Delhi", label: "North Delhi" },
  { value: "East Delhi", label: "East Delhi" },
  { value: "South Delhi", label: "South Delhi" },
  { value: "West Delhi", label: "West Delhi" },
  { value: "Central Delhi", label: "Central Delhi" },
];

function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    locality: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("Registration form submission initiated");
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);

      return;
    }

    // Create a copy without confirmPassword which shouldn't be sent to the API
    const apiData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      locality: formData.locality,
    };

    console.log("Registration data prepared:", {
      ...apiData,
      password: "[REDACTED]",
    });

    try {
      console.log("Sending registration request to API");
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      console.log("Registration API response status:", response.status);
      const data = await response.json();

      console.log("Registration API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      console.log("Registration successful, redirecting to login");
      // Redirect to login page with dashboard as the callback URL
      router.push("/login?registered=true&callbackUrl=/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during registration");
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
        <CardHeader className="flex flex-col items-center bg-primary/5 rounded-t-xl p-6">
          <h2 className="text-3xl font-bold">Create your account</h2>
          <p className="text-default-500 mt-1">Join the LocalVoice community</p>
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
                  htmlFor="name"
                  id="label-name"
                >
                  Full Name
                </label>
                <Input
                  fullWidth
                  required
                  aria-labelledby="label-name"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border-gray-300 focus:border-primary"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="email"
                >
                  Email address
                </label>
                <Input
                  fullWidth
                  required
                  autoComplete="email"
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
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
                  autoComplete="new-password"
                  id="password"
                  minLength={6}
                  name="password"
                  placeholder="••••••••"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="border-gray-300 focus:border-primary"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <Input
                  fullWidth
                  required
                  autoComplete="new-password"
                  id="confirmPassword"
                  minLength={6}
                  name="confirmPassword"
                  placeholder="••••••••"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="border-gray-300 focus:border-primary"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="locality"
                >
                  Locality
                </label>
                <Select
                  required
                  id="locality"
                  name="locality"
                  placeholder="Select your locality"
                  value={formData.locality}
                  onChange={(e) =>
                    setFormData({ ...formData, locality: e.target.value })
                  }
                  className="border-gray-300 focus:border-primary"
                >
                  {localities.map((loc) => (
                    <SelectItem key={loc.value} textValue={loc.value}>
                      {loc.label}
                    </SelectItem>
                  ))}
                </Select>
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
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
        </CardBody>

        <CardFooter className="flex justify-center p-6 bg-gray-50 dark:bg-gray-800/40 rounded-b-xl border-t dark:border-gray-700">
          <div className="text-sm text-center">
            Already have an account?{" "}
            <Link
              className="font-medium text-primary hover:text-primary-400"
              href="/login"
            >
              Sign in instead
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
function RegisterFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/30">
      <Card className="w-full max-w-md">
        <CardBody className="py-8">
          <div className="text-center">Loading registration page...</div>
        </CardBody>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterForm />
    </Suspense>
  );
}

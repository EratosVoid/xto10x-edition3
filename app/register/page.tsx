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
    voterId: "",
    email: "", // Optional
    phoneNumber: "", // Optional
    password: "",
    confirmPassword: "",
    name: "",
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
    const { confirmPassword, ...apiData } = formData;

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
                <label htmlFor="voterId" className="block text-sm font-medium mb-1">
                  Voter ID
                </label>
                <Input
                  type="text"
                  id="voterId"
                  name="voterId"
                  placeholder="Enter your Voter ID"
                  value={formData.voterId}
                  onChange={(e) => setFormData({ ...formData, voterId: e.target.value })}
                  required
                  fullWidth
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  fullWidth
                />
                <p className="text-xs text-gray-500 mt-1">Optional</p>
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    +91 {/* Assuming India for now */}
                  </span>
                  <Input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Optional</p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <Input
                  fullWidth
                  required
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
                >
                  {localities.map((loc) => (
                    <SelectItem key={loc.value} textValue={loc.value}>
                      {loc.label}
                    </SelectItem>
                  ))}
                </Select>
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
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="border-gray-300 focus:border-primary"
                />
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

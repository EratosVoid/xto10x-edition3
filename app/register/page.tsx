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
  { value: "Downtown", label: "Downtown" },
  { value: "Eastside", label: "Eastside" },
  { value: "Westside", label: "Westside" },
  { value: "Northside", label: "Northside" },
  { value: "Southside", label: "Southside" },
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
      // Redirect to login page
      router.push("/login?registered=true");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <h2 className="text-3xl font-bold">Create your account</h2>
        </CardHeader>

        <CardBody>
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="John Doe"
                  fullWidth
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  autoComplete="email"
                  required
                  placeholder="john@example.com"
                  fullWidth
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1"
                >
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  minLength={6}
                  fullWidth
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium mb-1"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  minLength={6}
                  fullWidth
                />
              </div>

              <div>
                <label
                  htmlFor="locality"
                  className="block text-sm font-medium mb-1"
                >
                  Locality
                </label>
                <Select
                  id="locality"
                  name="locality"
                  placeholder="Select your locality"
                  required
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
            </div>

            <Button
              type="submit"
              color="primary"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
        </CardBody>

        <CardFooter className="flex justify-center">
          <div className="text-sm text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary-400"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Fallback component while suspense is loading
function RegisterFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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

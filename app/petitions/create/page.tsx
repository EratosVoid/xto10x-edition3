"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Divider } from "@heroui/divider";

// Petition categories
const categories = [
  { value: "transportation", label: "Transportation" },
  { value: "education", label: "Education" },
  { value: "environment", label: "Environment" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "health", label: "Health" },
  { value: "safety", label: "Safety" },
];

export default function CreatePetitionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal: "",
    category: "education",
    locality: "",
    targetOfficial: "",
    expiration: "",
    createdBy: (session?.user as any)?.name || "",
  });

  const [validationErrors, setValidationErrors] = useState({
    title: "",
    description: "",
    goal: "",
    category: "",
    locality: "",
    expiration: "",
    targetOfficial: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {
      title: "",
      description: "",
      goal: "",
      category: "",
      locality: "",
      expiration: "",
      targetOfficial: "",
    };

    let isValid = true;

    if (!formData.title.trim()) {
      errors.title = "Title is required";
      isValid = false;
    } else if (formData.title.length < 5) {
      errors.title = "Title must be at least 5 characters";
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    } else if (formData.description.length < 10) {
      errors.description = "Description must be at least 10 characters";
      isValid = false;
    }

    if (!formData.goal || parseInt(formData.goal) <= 0) {
      errors.goal = "Please enter a valid signature goal";
      isValid = false;
    }

    if (!formData.locality.trim()) {
      errors.locality = "Locality is required";
      isValid = false;
    }

    if (!formData.targetOfficial.trim()) {
      errors.targetOfficial = "Target official or department is required";
      isValid = false;
    }

    if (!formData.expiration) {
      errors.expiration = "Expiration date is required";
      isValid = false;
    }

    setValidationErrors(errors);

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/petitions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          goal: parseInt(formData.goal),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Failed to create petition");
      }

      const data = await response.json();

      router.push(`/petitions/${data.id}`);
    } catch (err: any) {
      console.error("Petition creation failed:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/petitions/create");

    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <Card className="w-full">
        <CardHeader className="flex flex-col">
          <h1 className="text-3xl font-bold mb-2">Create a Petition</h1>
          <p className="text-default-500 mb-4">
            Help improve your community by starting a petition.
          </p>

          {error && (
            <div className="bg-danger-50 p-4 rounded-lg my-4 text-danger">
              {error}
            </div>
          )}
        </CardHeader>

        <CardBody>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="title">
                Petition Title <span className="text-danger">*</span>
              </label>
              <Input
                fullWidth
                errorMessage={validationErrors.title}
                id="title"
                isInvalid={!!validationErrors.title}
                name="title"
                placeholder="Enter petition title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="description"
              >
                Description <span className="text-danger">*</span>
              </label>
              <Textarea
                errorMessage={validationErrors.description}
                id="description"
                isInvalid={!!validationErrors.description}
                minRows={5}
                name="description"
                placeholder="Describe the issue and what you’re asking for..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Goal & Expiration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="goal"
                >
                  Signature Goal <span className="text-danger">*</span>
                </label>
                <Input
                  errorMessage={validationErrors.goal}
                  id="goal"
                  isInvalid={!!validationErrors.goal}
                  min="1"
                  name="goal"
                  placeholder="e.g. 100"
                  type="number"
                  value={formData.goal}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="expiration"
                >
                  Expiration Date <span className="text-danger">*</span>
                </label>
                <Input
                  errorMessage={validationErrors.expiration}
                  id="expiration"
                  isInvalid={!!validationErrors.expiration}
                  name="expiration"
                  type="date"
                  value={formData.expiration}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Category, Locality, Target */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="category"
                >
                  Category <span className="text-danger">*</span>
                </label>
                <Select
                  fullWidth
                  errorMessage={validationErrors.category}
                  id="category"
                  isInvalid={!!validationErrors.category}
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} textValue={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="locality"
                >
                  Locality <span className="text-danger">*</span>
                </label>
                <Input
                  errorMessage={validationErrors.locality}
                  id="locality"
                  isInvalid={!!validationErrors.locality}
                  name="locality"
                  placeholder="e.g. Downtown, Eastside"
                  value={formData.locality}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Target Official */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="targetOfficial"
              >
                Target Official/Department{" "}
                <span className="text-danger">*</span>
              </label>
              <Input
                errorMessage={validationErrors.targetOfficial}
                id="targetOfficial"
                isInvalid={!!validationErrors.targetOfficial}
                name="targetOfficial"
                placeholder="e.g. Mayor, School Board"
                value={formData.targetOfficial}
                onChange={handleChange}
              />
            </div>

            <Divider className="my-4" />

            <div className="flex justify-end gap-2">
              <Button
                disabled={isSubmitting}
                variant="flat"
                onClick={() => router.push("/petitions")}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                type="submit"
              >
                Create Petition
              </Button>
            </div>
          </form>
        </CardBody>

        <CardFooter>
          <div className="text-small text-default-500">
            <p>
              <strong>Note:</strong> Make sure all the details are correct
              before submitting, as your petition will be accessible to others
              in your locality.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

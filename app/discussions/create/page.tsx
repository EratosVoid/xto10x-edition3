"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { useSession } from "next-auth/react";

// Category options
const categories = [
  { value: "safety", label: "Safety" },
  { value: "events", label: "Events" },
  { value: "business", label: "Business" },
  { value: "environment", label: "Environment" },
  { value: "education", label: "Education" },
  { value: "infrastructure", label: "Infrastructure" },
];

// Locality options (example)
const localities = [
  { value: "downtown", label: "Downtown" },
  { value: "eastside", label: "Eastside" },
  { value: "westside", label: "Westside" },
  { value: "northside", label: "Northside" },
  { value: "southside", label: "Southside" },
];

export default function CreateDiscussionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    locality: "",
  });

  // Redirect to login if not authenticated
  if (status === "loading") {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">Loading...</div>
    );
  }

  if (status !== "authenticated") {
    // This will redirect on the client side
    if (typeof window !== "undefined") {
      router.push("/login?callbackUrl=/discussions/create");
    }

    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        Redirecting to login...
      </div>
    );
  }

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 10) {
      newErrors.title = "Title should be at least 10 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    } else if (formData.content.length < 20) {
      newErrors.content = "Content should be at least 20 characters";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.locality) {
      newErrors.locality = "Please select a locality";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real application, this would be an API call
      console.log("Submitting discussion:", formData);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to discussions page
      router.push("/discussions");
    } catch (error) {
      console.error("Error creating discussion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Start a Discussion</h1>
        <p className="text-default-500">
          Share your thoughts, ideas, or concerns with your community
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <h2 className="text-xl font-semibold">Discussion Details</h2>
        </CardHeader>

        <CardBody>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="title">
                Title <span className="text-danger">*</span>
              </label>
              <Input
                className={errors.title ? "border-danger" : ""}
                id="title"
                name="title"
                placeholder="Give your discussion a descriptive title"
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && (
                <p className="mt-1 text-danger text-xs">{errors.title}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="content"
              >
                Content <span className="text-danger">*</span>
              </label>
              <Textarea
                className={errors.content ? "border-danger" : ""}
                id="content"
                minRows={6}
                name="content"
                placeholder="Describe your topic in detail. What would you like to discuss with the community?"
                value={formData.content}
                onChange={handleChange}
              />
              {errors.content && (
                <p className="mt-1 text-danger text-xs">{errors.content}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="category"
                >
                  Category <span className="text-danger">*</span>
                </label>
                <Select
                  className={errors.category ? "border-danger" : ""}
                  id="category"
                  name="category"
                  placeholder="Select a category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <SelectItem key={category.value} textValue={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </Select>
                {errors.category && (
                  <p className="mt-1 text-danger text-xs">{errors.category}</p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="locality"
                >
                  Locality <span className="text-danger">*</span>
                </label>
                <Select
                  className={errors.locality ? "border-danger" : ""}
                  id="locality"
                  name="locality"
                  placeholder="Select a locality"
                  value={formData.locality}
                  onChange={handleChange}
                >
                  {localities.map((locality) => (
                    <SelectItem key={locality.value} textValue={locality.value}>
                      {locality.label}
                    </SelectItem>
                  ))}
                </Select>
                {errors.locality && (
                  <p className="mt-1 text-danger text-xs">{errors.locality}</p>
                )}
              </div>
            </div>
          </form>
        </CardBody>

        <CardFooter className="flex justify-between">
          <Button
            color="default"
            variant="flat"
            onClick={() => router.push("/discussions")}
          >
            Cancel
          </Button>

          <Button
            color="primary"
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Creating..." : "Create Discussion"}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-6 bg-default-50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Discussion Guidelines</h3>
        <ul className="text-sm text-default-500 space-y-1 list-disc pl-5">
          <li>Keep conversations respectful and constructive</li>
          <li>Provide specific details to help others understand your topic</li>
          <li>
            Consider including relevant information like dates, locations, or
            contact details when appropriate
          </li>
          <li>Stay on topic and avoid posting duplicate discussions</li>
          <li>
            Respect others&apos; privacy and do not share personal information
            without consent
          </li>
        </ul>
      </div>
    </div>
  );
}

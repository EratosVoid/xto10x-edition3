"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";

// Post categories
const categories = [
  { value: "community", label: "Community", color: "primary" },
  { value: "events", label: "Events", color: "success" },
  { value: "announcements", label: "Announcements", color: "warning" },
  { value: "help", label: "Help Needed", color: "danger" },
  { value: "discussion", label: "Discussion", color: "secondary" },
];

// Post types
const postTypes = [
  { value: "general", label: "General Post" },
  { value: "event", label: "Event" },
  { value: "poll", label: "Poll" },
  { value: "petition", label: "Petition" },
  { value: "announcement", label: "Announcement" },
];

// Priority options
const priorities = [
  { value: "low", label: "Low Priority", color: "default" },
  { value: "medium", label: "Medium Priority", color: "primary" },
  { value: "high", label: "High Priority", color: "danger" },
];

export default function CreatePostPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "general",
    category: "community",
    priority: "medium",
  });

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState({
    title: "",
    description: "",
    type: "",
    category: "",
  });

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when field is edited
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {
      title: "",
      description: "",
      type: "",
      category: "",
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

    if (!formData.type) {
      errors.type = "Please select a post type";
      isValid = false;
    }

    if (!formData.category) {
      errors.category = "Please select a category";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create post");
      }

      const data = await response.json();

      // Redirect to the new post
      router.push(`/posts/${data._id}`);
    } catch (err: any) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if not authenticated
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/posts/create");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <Card className="w-full">
        <CardHeader className="flex flex-col">
          <h1 className="text-3xl font-bold mb-2">Create a New Post</h1>
          <p className="text-default-500 mb-4">
            Share something with your {(session?.user as any)?.locality}{" "}
            community
          </p>

          {error && (
            <div className="bg-danger-50 p-4 rounded-lg my-4 text-danger">
              {error}
            </div>
          )}
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Post Title <span className="text-danger">*</span>
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a title for your post"
                isInvalid={!!validationErrors.title}
                errorMessage={validationErrors.title}
                fullWidth
              />
            </div>

            {/* Post Type & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium mb-1"
                >
                  Post Type <span className="text-danger">*</span>
                </label>
                <Select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.type}
                  errorMessage={validationErrors.type}
                  fullWidth
                >
                  {postTypes.map((type) => (
                    <SelectItem key={type.value} textValue={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium mb-1"
                >
                  Category <span className="text-danger">*</span>
                </label>
                <Select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.category}
                  errorMessage={validationErrors.category}
                  fullWidth
                >
                  {categories.map((category) => (
                    <SelectItem key={category.value} textValue={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <div className="flex flex-wrap gap-2">
                {priorities.map((priority) => (
                  <Chip
                    key={priority.value}
                    color={
                      priority.value === formData.priority
                        ? (priority.color as any)
                        : "default"
                    }
                    variant={
                      priority.value === formData.priority ? "solid" : "flat"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        priority: priority.value,
                      }))
                    }
                  >
                    {priority.label}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1"
              >
                Description <span className="text-danger">*</span>
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your post in detail..."
                minRows={5}
                isInvalid={!!validationErrors.description}
                errorMessage={validationErrors.description}
              />
            </div>

            <Divider className="my-4" />

            <div className="flex justify-end gap-2">
              <Button
                variant="flat"
                onClick={() => router.push("/posts")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Create Post
              </Button>
            </div>
          </form>
        </CardBody>

        <CardFooter>
          <div className="text-small text-default-500">
            <p>
              <strong>Note:</strong> Your post will only be visible to members
              of your locality.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

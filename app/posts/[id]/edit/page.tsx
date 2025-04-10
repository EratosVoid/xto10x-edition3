"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";

// Post categories
const categories = [
  { value: "community", label: "Community", color: "primary" },
  { value: "events", label: "Events", color: "success" },
  { value: "announcements", label: "Announcements", color: "warning" },
  { value: "help", label: "Help Needed", color: "danger" },
  { value: "discussion", label: "Discussion", color: "secondary" },
];

// Priority options
const priorities = [
  { value: "low", label: "Low Priority", color: "default" },
  { value: "medium", label: "Medium Priority", color: "primary" },
  { value: "high", label: "High Priority", color: "danger" },
];

export default function EditPostPage({ params }: any) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
  });

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState({
    title: "",
    description: "",
    category: "",
  });

  // Fetch post data
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/posts/${params.id}/edit`);
      return;
    }

    fetchPost();
  }, [status, params.id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/posts/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Post not found");
        } else if (response.status === 403) {
          throw new Error("You don't have access to this post");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch post");
        }
      }

      const post = await response.json();

      // Check if current user is the post author
      if (post.createdBy._id !== (session?.user as any)?.id) {
        throw new Error("You can only edit your own posts");
      }

      // Set form data
      setFormData({
        title: post.title,
        description: post.description,
        category: post.category,
        priority: post.priority,
      });
    } catch (err: any) {
      console.error("Error fetching post:", err);
      setError(err.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

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
      const response = await fetch(`/api/posts/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update post");
      }

      const data = await response.json();

      // Redirect to the post detail page
      router.push(`/posts/${params.id}`);
    } catch (err: any) {
      console.error("Error updating post:", err);
      setError(err.message || "Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading or error state
  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <Card className="w-full">
          <CardBody>
            <div className="flex flex-col items-center py-8">
              <div className="text-danger mb-4 text-xl">Error</div>
              <p className="text-center mb-6">{error}</p>
              <Button
                color="primary"
                variant="flat"
                onClick={() => router.push(`/posts/${params.id}`)}
              >
                Back to Post
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <Card className="w-full">
        <CardHeader className="flex flex-col">
          <h1 className="text-3xl font-bold mb-2">Edit Post</h1>

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

            {/* Category */}
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
                onClick={() => router.push(`/posts/${params.id}`)}
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
                Update Post
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

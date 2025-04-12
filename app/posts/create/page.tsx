"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@heroui/spinner";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Divider } from "@heroui/divider";

import PostForm, { PostFormData } from "@/components/PostForm";

export default function CreatePostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Get post type from URL query if present
  const typeFromParams = searchParams.get("type");

  // Handle form submission
  const handleSubmit = async (formData: PostFormData) => {
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/posts/create");
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Get the post type label for display
  const getPostTypeLabel = () => {
    if (!typeFromParams) return "Post";

    const typeMap: { [key: string]: string } = {
      general: "General Post",
      event: "Event",
      poll: "Poll",
      petition: "Petition",
      announcement: "Announcement",
    };

    return typeMap[typeFromParams] || "Post";
  };

  return (
    <div className="w-full md:px-32 py-8 px-4">
      {/* Breadcrumbs */}
      <Breadcrumbs className="mb-6">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/posts">Posts</BreadcrumbItem>
        <BreadcrumbItem>Create {getPostTypeLabel()}</BreadcrumbItem>
      </Breadcrumbs>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create {getPostTypeLabel()}</h1>
        <p className="text-default-500">
          Share your ideas, events, or questions with your community
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-danger">
          <CardBody className="bg-danger-50 text-danger">
            <p className="font-medium">{error}</p>
          </CardBody>
        </Card>
      )}

      <Card className="shadow-sm border">
        <CardHeader className="bg-default-50 text-default-700 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-lg">New {getPostTypeLabel()} Details</span>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <PostForm
            error={error}
            initialData={{
              title: "",
              description: "",
              type: typeFromParams || "general",
              priority: "medium",
            }}
            isEditing={false}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </CardBody>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@heroui/spinner";

import PostForm, { PostFormData } from "@/components/PostForm";

export default function CreatePostPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <PostForm
        error={error}
        initialData={{
          title: "",
          description: "",
          type: "general",
          priority: "medium",
        }}
        isEditing={false}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@heroui/spinner";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { use } from "react";
import PostForm, { PostFormData } from "@/components/PostForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: PageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [post, setPost] = useState<PostFormData | null>(null);
  const resolvedParams = use(params);

  // Fetch post data
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/posts/${resolvedParams.id}/edit`);
      return;
    }

    fetchPost();
  }, [status, resolvedParams.id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/posts/${resolvedParams.id}`);

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

      const postData = await response.json();

      // Check if current user is the post author
      if (postData.createdBy._id !== (session?.user as any)?.id) {
        throw new Error("You can only edit your own posts");
      }

      // Set post data
      setPost({
        title: postData.title,
        description: postData.description,
        type: postData.type,
        priority: postData.priority,
      });
    } catch (err: any) {
      console.error("Error fetching post:", err);
      setError(err.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: PostFormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      // Only send title and description for updates
      const updateData = {
        title: formData.title,
        description: formData.description,
      };

      const response = await fetch(`/api/posts/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update post");
      }

      // Redirect to the post detail page
      router.push(`/posts/${resolvedParams.id}`);
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

  if (error && !post) {
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
                onClick={() => router.push(`/posts/${resolvedParams.id}`)}
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
      {post && (
        <PostForm
          initialData={post}
          isEditing={true}
          postId={resolvedParams.id}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </div>
  );
}

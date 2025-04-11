"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { useDisclosure } from "@heroui/modal";
import { Divider } from "@heroui/divider";
import { use } from "react";

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const resolvedParams = use(params);

  // Fetch post data
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/posts/${resolvedParams.id}`);
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

      const data = await response.json();
      setPost(data);
    } catch (err: any) {
      console.error("Error fetching post:", err);
      setError(err.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/posts/${resolvedParams.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete post");
      }

      router.push("/posts");
    } catch (err: any) {
      console.error("Error deleting post:", err);
      setError(err.message || "Failed to delete post");
      onClose(); // Close modal on error
    } finally {
      setIsDeleting(false);
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
                onClick={() => router.push("/posts")}
              >
                Back to Posts
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const priorityColors: Record<string, string> = {
      low: "success",
      medium: "warning",
      high: "danger",
    };

    return priorityColors[priority] || "default";
  };

  // Check if current user is the post author
  const isAuthor = post?.createdBy?._id === (session?.user as any)?.id;

  // Check if user is moderator or admin
  const isModeratorOrAdmin =
    (session?.user as any)?.role === "moderator" ||
    (session?.user as any)?.role === "admin";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {post && (
        <Card className="w-full">
          <CardHeader className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{post.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Chip color="default" variant="flat">
                    {post.type}
                  </Chip>
                  <Chip
                    color={getPriorityColor(post.priority) as any}
                    variant="flat"
                    size="sm"
                  >
                    {post.priority} priority
                  </Chip>
                </div>
              </div>
              {(isAuthor || isModeratorOrAdmin) && (
                <div className="flex gap-2">
                  {isAuthor && (
                    <Button
                      variant="flat"
                      color="primary"
                      onClick={() => router.push(`/posts/${post._id}/edit`)}
                    >
                      Edit
                    </Button>
                  )}
                  <Button variant="flat" color="danger" onClick={onOpen}>
                    Delete
                  </Button>
                </div>
              )}
            </div>

            <Divider className="my-2" />

            <div className="flex items-center gap-2">
              <Avatar
                src={post.createdBy?.image || "https://i.pravatar.cc/150?img=1"}
                name={post.createdBy?.name || "User"}
                size="sm"
              />
              <div>
                <div className="text-small font-medium">
                  {post.createdBy?.name}
                </div>
                <div className="text-tiny text-default-500">
                  Posted on {formatDate(post.createdAt)}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardBody>
            <p className="whitespace-pre-line">{post.description}</p>

            <div className="mt-6 text-small text-default-500">
              <p>Locality: {post.locality}</p>
            </div>
          </CardBody>

          <CardFooter>
            <Button variant="flat" onClick={() => router.push("/posts")}>
              Back to Posts
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Delete Post</ModalHeader>
          <ModalBody>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              color="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

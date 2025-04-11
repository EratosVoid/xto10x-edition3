import React, { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Divider } from "@heroui/divider";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { useDisclosure } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { useSession } from "next-auth/react";

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get initials from name
const getInitials = (name: string): string => {
  if (!name) return "??";

  const parts = name.split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface User {
  _id: string;
  name: string;
}

interface Discussion {
  _id: string;
  content: string;
  createdBy: User;
  postId: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

interface DiscussionThreadProps {
  postId: string;
}

export default function DiscussionThread({ postId }: DiscussionThreadProps) {
  const { data: session } = useSession();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<Discussion | null>(null);
  const [editingDiscussion, setEditingDiscussion] = useState<Discussion | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [discussionToDelete, setDiscussionToDelete] =
    useState<Discussion | null>(null);

  // Fetch discussions & refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDiscussions();
    }, 60000);
    fetchDiscussions();
    return () => clearInterval(interval);
  }, [postId]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/posts/${postId}/discussions`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch discussions");
      }

      const data = await response.json();
      setDiscussions(data);
    } catch (err: any) {
      console.error("Error fetching discussions:", err);
      setError(err.message || "Failed to load discussions");
    } finally {
      setLoading(false);
    }
  };

  // Handle submit discussion
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      setSubmitting(true);
      setError("");

      // Prepare the request body
      const requestBody = {
        content: message,
        ...(replyingTo && { parentId: replyingTo._id }),
      };

      // Send the API request
      const response = await fetch(`/api/posts/${postId}/discussions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post discussion");
      }

      // Get the new discussion from the server
      const newDiscussion = await response.json();

      // Add the new discussion to the list
      setDiscussions([newDiscussion, ...discussions]);

      // Reset form state
      setMessage("");
      setReplyingTo(null);

      // Fetch all discussions to ensure we have the latest data
      fetchDiscussions();
    } catch (err: any) {
      console.error("Error posting discussion:", err);
      setError(err.message || "Failed to post discussion");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit discussion
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingDiscussion || !message.trim()) return;

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        `/api/posts/${postId}/discussions/${editingDiscussion._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: message,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update discussion");
      }

      const updatedDiscussion = await response.json();

      // Update the discussion in the state
      setDiscussions(
        discussions.map((d) =>
          d._id === updatedDiscussion._id ? updatedDiscussion : d
        )
      );

      // Reset form
      setMessage("");
      setEditingDiscussion(null);
    } catch (err: any) {
      console.error("Error updating discussion:", err);
      setError(err.message || "Failed to update discussion");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete discussion
  const handleDelete = async () => {
    if (!discussionToDelete) return;

    try {
      setSubmitting(true);
      setError("");
      onClose(); // Close modal first

      const response = await fetch(
        `/api/posts/${postId}/discussions/${discussionToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete discussion");
      }

      // Refresh discussions to get the latest state
      fetchDiscussions();
    } catch (err: any) {
      console.error("Error deleting discussion:", err);
      setError(err.message || "Failed to delete discussion");
    } finally {
      setSubmitting(false);
      setDiscussionToDelete(null);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (discussion: Discussion) => {
    setDiscussionToDelete(discussion);
    onOpen();
  };

  // Start editing a discussion
  const startEditing = (discussion: Discussion) => {
    setEditingDiscussion(discussion);
    setMessage(discussion.content);
    setReplyingTo(null);
  };

  // Start replying to a discussion
  const startReplying = (discussion: Discussion) => {
    setReplyingTo(discussion);
    setEditingDiscussion(null);
    setMessage("");
  };

  // Cancel editing or replying
  const cancelAction = () => {
    setEditingDiscussion(null);
    setReplyingTo(null);
    setMessage("");
  };

  // Check if user is authorized to modify a discussion
  const canModifyDiscussion = (discussion: Discussion) => {
    if (!session?.user) return false;

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    return (
      discussion.createdBy._id === userId ||
      userRole === "admin" ||
      userRole === "moderator"
    );
  };

  // Group discussions by parent/child relationships
  const organizeDiscussions = (allDiscussions: Discussion[]) => {
    const topLevelDiscussions = allDiscussions.filter((d) => !d.parentId);
    const replies = allDiscussions.filter((d) => d.parentId);

    // Group replies by parent ID
    const replyMap: Record<string, Discussion[]> = {};
    replies.forEach((reply) => {
      if (reply.parentId) {
        if (!replyMap[reply.parentId]) {
          replyMap[reply.parentId] = [];
        }
        replyMap[reply.parentId].push(reply);
      }
    });

    return { topLevelDiscussions, replyMap };
  };

  const { topLevelDiscussions, replyMap } = organizeDiscussions(discussions);

  // Render a discussion item
  const renderDiscussion = (discussion: Discussion, isReply = false) => {
    if (discussion.isDeleted) {
      return (
        <div
          key={discussion._id}
          className={`${
            isReply ? "ml-12 mt-2" : "mt-4"
          } p-3 bg-default-50 rounded-lg`}
        >
          <p className="text-default-400 italic">
            This comment has been deleted.
          </p>
        </div>
      );
    }

    return (
      <div
        key={discussion._id}
        className={`${isReply ? "ml-12 mt-2" : "mt-4"} p-4 bg-default-50 rounded-lg`}
      >
        <div className="flex gap-3">
          <Avatar
            name={discussion.createdBy.name}
            showFallback
            fallback={getInitials(discussion.createdBy.name)}
            size="sm"
          />
          <div className="flex-1">
            <div className="flex justify-between">
              <p className="font-semibold text-foreground">
                {discussion.createdBy.name}
              </p>
              <p className="text-xs text-default-400">
                {formatDate(discussion.createdAt)}
              </p>
            </div>
            <p className="mt-1 text-default-700">{discussion.content}</p>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="light"
                onPress={() => startReplying(discussion)}
              >
                Reply
              </Button>
              {canModifyDiscussion(discussion) && (
                <>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => startEditing(discussion)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => openDeleteModal(discussion)}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Discussion</h3>

      {/* Comment input */}
      <Card className="mb-6">
        <CardBody>
          {error && <p className="text-danger mb-4">{error}</p>}
          <form onSubmit={editingDiscussion ? handleEditSubmit : handleSubmit}>
            <div className="flex gap-3">
              <Avatar
                name={session?.user?.name || "Guest"}
                showFallback
                fallback={getInitials(session?.user?.name || "Guest User")}
                size="sm"
              />
              <div className="flex-1">
                {replyingTo && (
                  <div className="mb-2 text-sm text-default-500">
                    Replying to {replyingTo.createdBy.name}&apos;s comment
                    <Button
                      size="sm"
                      variant="light"
                      className="ml-2"
                      onPress={cancelAction}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {editingDiscussion && (
                  <div className="mb-2 text-sm text-default-500">
                    Editing your comment
                    <Button
                      size="sm"
                      variant="light"
                      className="ml-2"
                      onPress={cancelAction}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                <Textarea
                  placeholder={
                    replyingTo
                      ? `Reply to ${replyingTo.createdBy.name}...`
                      : editingDiscussion
                        ? "Edit your comment..."
                        : "Add a comment..."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  disabled={!session?.user}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    color="primary"
                    type="submit"
                    isDisabled={!message.trim() || submitting || !session?.user}
                    isLoading={submitting}
                  >
                    {editingDiscussion
                      ? "Save Edit"
                      : replyingTo
                        ? "Post Reply"
                        : "Post Comment"}
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {!session?.user && (
            <div className="text-center mt-4 text-default-500">
              Please sign in to participate in discussions.
            </div>
          )}
        </CardBody>
      </Card>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : discussions.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-default-500 py-6">
              No comments yet. Be the first to start the discussion!
            </p>
          </CardBody>
        </Card>
      ) : (
        <div>
          {discussions
            .filter((discussion) => !discussion.parentId)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((discussion) => (
              <div key={discussion._id} className="flex w-full flex-col">
                {renderDiscussion(discussion)}
                {/* Find and render all replies to this discussion */}
                <div className="ml-12">
                  {discussions
                    .filter(
                      (reply) => (reply.parentId as any)?._id === discussion._id
                    )
                    .sort(
                      (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                    )
                    .map((reply) => renderDiscussion(reply, true))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

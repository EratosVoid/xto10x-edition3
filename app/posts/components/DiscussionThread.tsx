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

interface User {
  _id: string;
  name: string;
  image: string;
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

  // Fetch discussions
  useEffect(() => {
    fetchDiscussions();
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

      const response = await fetch(`/api/posts/${postId}/discussions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message,
          ...(replyingTo && { parentId: replyingTo._id }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post discussion");
      }

      const newDiscussion = await response.json();

      if (replyingTo) {
        setReplyingTo(null);
      }

      // Add to discussions
      setDiscussions([newDiscussion, ...discussions]);
      setMessage("");
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

      // Update in discussions
      setDiscussions(
        discussions.map((d) =>
          d._id === updatedDiscussion._id ? updatedDiscussion : d
        )
      );

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

      // Refresh discussions
      fetchDiscussions();
      onClose();
    } catch (err: any) {
      console.error("Error deleting discussion:", err);
      setError(err.message || "Failed to delete discussion");
    } finally {
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

  const renderDiscussion = (discussion: Discussion, isReply = false) => {
    const replies = replyMap[discussion._id] || [];

    return (
      <div key={discussion._id} className={`mb-4 ${isReply ? "ml-8" : ""}`}>
        <div className="flex gap-3">
          <Avatar
            src={
              discussion.createdBy?.image || "https://i.pravatar.cc/150?img=1"
            }
            name={discussion.createdBy?.name || "User"}
            size="sm"
          />
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <div>
                <span className="font-medium">
                  {discussion.createdBy?.name}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {formatDate(discussion.createdAt)}
                </span>
              </div>
              {canModifyDiscussion(discussion) && !discussion.isDeleted && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onClick={() => startEditing(discussion)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    onClick={() => openDeleteModal(discussion)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
            <div
              className={`mb-2 ${discussion.isDeleted ? "italic text-gray-500" : ""}`}
            >
              {discussion.content}
            </div>
            <Button
              size="sm"
              variant="flat"
              color="default"
              onClick={() => startReplying(discussion)}
            >
              Reply
            </Button>
          </div>
        </div>

        {/* Render replies */}
        {replies.length > 0 && (
          <div className="mt-3 pl-6 border-l-2 border-gray-200">
            {replies.map((reply) => renderDiscussion(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <Card>
        <CardBody>
          <h2 className="text-xl font-bold mb-4">Discussion</h2>

          {error && (
            <div className="bg-danger-50 p-4 rounded-lg mb-4 text-danger">
              {error}
            </div>
          )}

          {/* Comment Form */}
          <form
            onSubmit={editingDiscussion ? handleEditSubmit : handleSubmit}
            className="mb-6"
          >
            <div className="mb-2">
              {replyingTo && (
                <div className="text-sm text-gray-600 mb-2">
                  Replying to{" "}
                  <span className="font-medium">
                    {replyingTo.createdBy.name}
                  </span>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    className="ml-2"
                    onClick={cancelAction}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {editingDiscussion && (
                <div className="text-sm text-gray-600 mb-2">
                  Editing comment
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    className="ml-2"
                    onClick={cancelAction}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts..."
                minRows={3}
                fullWidth
              />
            </div>
            <Button
              type="submit"
              color="primary"
              isLoading={submitting}
              disabled={submitting || !message.trim()}
            >
              {editingDiscussion ? "Update" : "Post"}
            </Button>
          </form>

          <Divider className="my-4" />

          {/* Discussions List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : discussions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Be the first to start the discussion!
            </p>
          ) : (
            <div>
              {topLevelDiscussions.map((discussion) =>
                renderDiscussion(discussion)
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Delete Comment</ModalHeader>
          <ModalBody>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={onClose}>
              Cancel
            </Button>
            <Button color="danger" onClick={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

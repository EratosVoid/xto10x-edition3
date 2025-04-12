"use client";

import { useState, useEffect, useRef } from "react";
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
import DiscussionThread from "../../../components/DiscussionThread";
import {
  resetSpeechSynthesis,
  speakText,
  isSpeechSynthesisSupported,
} from "@/lib/speechSynthesis";

// Sparkle icon for AI summarize button
const SparkleIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-1"
  >
    <path
      d="M12 3L13.775 8.4254H19.5L14.863 11.8492L16.638 17.2746L12 13.8508L7.36206 17.2746L9.13709 11.8492L4.5 8.4254H10.225L12 3Z"
      fill="currentColor"
    />
  </svg>
);

// Audio icon for voice playback
const AudioIcon = ({ isPlaying = false }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-1"
  >
    {isPlaying ? (
      // Pause icon when playing
      <path d="M10 9H6V15H10V9ZM18 9H14V15H18V9Z" fill="currentColor" />
    ) : (
      // Play icon when paused
      <path
        d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"
        fill="currentColor"
      />
    )}
  </svg>
);

// Chart icon for visualize impact button
const ChartIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-1"
  >
    <path
      d="M5 21V7M19 21V3M12 21V12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Get initials from name
const getInitials = (name: string): string => {
  if (!name) return "??";

  const parts = name.split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

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
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [visualizing, setVisualizing] = useState(false);
  const [visualization, setVisualization] = useState<any>(null);

  // Cancel speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        resetSpeechSynthesis();
      }
    };
  }, []);

  // Check speech synthesis support on component mount
  useEffect(() => {
    const supported = isSpeechSynthesisSupported();
    if (!supported) {
      console.warn("Speech synthesis is not supported in this browser");
    }
  }, []);

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

  // Handle summarize action
  const handleSummarize = async () => {
    if (summarizing || summary) return;

    try {
      setSummarizing(true);

      const response = await fetch(`/api/ai/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: resolvedParams.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to summarize post");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err: any) {
      console.error("Error summarizing post:", err);
      setError(err.message || "Failed to summarize post");
    } finally {
      setSummarizing(false);
    }
  };

  // Handle voice playback
  const handleVoicePlayback = async () => {
    if (!summary) return;

    // Reset any previous errors
    setSpeechError(null);

    // If the browser doesn't support speech synthesis
    if (!isSpeechSynthesisSupported()) {
      setSpeechError("Your browser doesn't support speech synthesis");
      return;
    }

    // If already playing, stop it
    if (isPlaying) {
      resetSpeechSynthesis();
      setIsPlaying(false);
      return;
    }

    try {
      // Start playing
      setIsPlaying(true);

      console.log("Starting to speak summary with length:", summary.length);

      // Attempt to speak the entire summary
      const success = await speakText(summary);

      if (!success) {
        setSpeechError("Failed to play the summary");
      }

      // Speech completes naturally or was stopped
      setIsPlaying(false);
    } catch (error) {
      console.error("Speech synthesis error:", error);
      setIsPlaying(false);
      setSpeechError("An error occurred during playback");
    }
  };

  // Handle visualization creation
  const handleVisualizeImpact = async () => {
    if (visualizing) return;

    try {
      setVisualizing(true);
      setVisualization(null);

      const response = await fetch(`/api/ai/visualize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: resolvedParams.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to visualize impact");
      }

      const data = await response.json();
      setVisualization(data.visualization);
    } catch (err: any) {
      console.error("Error visualizing impact:", err);
      setError(err.message || "Failed to visualize impact");
    } finally {
      setVisualizing(false);
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

  // Render post details based on type
  const renderPostTypeDetails = () => {
    if (!post) return null;

    switch (post.type) {
      case "event":
        return (
          <div className="mt-6 bg-primary-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Start Date:</p>
                <p>
                  {post.eventId?.startDate
                    ? formatDate(post.eventId.startDate)
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="font-medium">End Date:</p>
                <p>
                  {post.eventId?.endDate
                    ? formatDate(post.eventId.endDate)
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="font-medium">Duration:</p>
                <p>
                  {post.eventId?.duration
                    ? `${post.eventId.duration} minutes`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="font-medium">Location:</p>
                <p>{post.eventId?.location || "N/A"}</p>
              </div>
            </div>
          </div>
        );
      case "poll":
        return (
          <div className="mt-6 bg-primary-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Poll</h3>
            <div className="space-y-2">
              {post.pollId?.options &&
                Object.entries(post.pollId.options).map(
                  ([option, votes]: [string, any]) => (
                    <div key={option} className="flex justify-between">
                      <span>{option}</span>
                      <span className="font-medium">{votes} votes</span>
                    </div>
                  )
                )}
              {(!post.pollId?.options ||
                Object.keys(post.pollId.options).length === 0) && (
                <p className="text-gray-500">No poll options available</p>
              )}
            </div>
          </div>
        );
      case "petition":
        return (
          <div className="mt-6 bg-primary-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Petition</h3>
            <div className="mb-4">
              <p className="font-medium">Target:</p>
              <p>{post.petitionId?.target || "N/A"}</p>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>
                  Progress: {post.petitionId?.signatures || 0} /{" "}
                  {post.petitionId?.goal || 100}
                </span>
                <span>
                  {Math.floor(
                    ((post.petitionId?.signatures || 0) /
                      (post.petitionId?.goal || 100)) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{
                    width: `${Math.min(((post.petitionId?.signatures || 0) / (post.petitionId?.goal || 100)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <Button
              color="primary"
              isDisabled={post.petitionId?.supporters?.some(
                (supporter: any) => supporter === (session?.user as any)?.id
              )}
              onClick={async () => {
                if (!session) {
                  router.push("/login");
                  return;
                }

                try {
                  const res = await fetch(
                    `/api/petitions/${post.petitionId?._id}/sign`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  );

                  if (res.ok) {
                    // Refresh the page to show updated signatures
                    router.refresh();
                  }
                } catch (error) {
                  console.error("Failed to sign petition:", error);
                }
              }}
            >
              {post.petitionId?.supporters?.some(
                (supporter: any) => supporter === (session?.user as any)?.id
              )
                ? "Already Signed"
                : "Sign Petition"}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {post && (
        <>
          <Card className="w-full mb-6">
            <CardHeader className="flex flex-col gap-2 px-10">
              <div className="flex justify-between items-start w-full pt-4">
                <div>
                  <h1 className="text-3xl font-bold">{post.title}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Chip color="default" variant="flat">
                      {post.type}
                    </Chip>
                    <Chip
                      color={getPriorityColor(post.priority) as any}
                      size="sm"
                      variant="flat"
                    >
                      {post.priority} priority
                    </Chip>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    color="secondary"
                    startContent={<SparkleIcon />}
                    onPress={() => handleSummarize()}
                  >
                    Summarize
                  </Button>
                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<ChartIcon />}
                    onPress={handleVisualizeImpact}
                  >
                    Visualize Impact
                  </Button>
                  {(isAuthor || isModeratorOrAdmin) && (
                    <>
                      {isAuthor && (
                        <Button
                          color="primary"
                          onPress={() => router.push(`/posts/${post._id}/edit`)}
                        >
                          Edit
                        </Button>
                      )}
                      <Button variant="flat" color="danger" onPress={onOpen}>
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Divider className="my-2" />

              <div className="flex items-center gap-4 mb-6 mr-auto">
                <Avatar
                  name={post.createdBy?.name || "User"}
                  showFallback
                  fallback={getInitials(post.createdBy?.name || "User")}
                  size="lg"
                />
                <div>
                  <p className="font-semibold text-xl">
                    {post.createdBy?.name}
                  </p>
                  <p className="text-default-500">
                    Posted on {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="px-10">
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{post.description}</p>
              </div>

              {/* Summary section */}
              {(summarizing || summary) && (
                <div className="mt-6 bg-secondary-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <SparkleIcon />
                      <h3 className="text-lg font-semibold">AI Summary</h3>
                    </div>
                    {summary && (
                      <Button
                        size="sm"
                        color="secondary"
                        variant="flat"
                        startContent={<AudioIcon isPlaying={isPlaying} />}
                        onClick={handleVoicePlayback}
                        isDisabled={summarizing}
                      >
                        {isPlaying ? "Stop" : "Play"}
                      </Button>
                    )}
                  </div>
                  {summarizing ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" color="secondary" />
                      <span>Generating summary...</span>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-line">{summary}</p>
                      {speechError && (
                        <p className="text-danger text-sm mt-2">
                          {speechError}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Visualization section */}
              {(visualizing || visualization) && (
                <div className="mt-6 bg-primary-50 dark:bg-primary-950/20 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
                  <div className="flex items-center mb-3">
                    <ChartIcon />
                    <h3 className="text-lg font-semibold">Community Impact</h3>
                  </div>
                  {visualizing ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" color="primary" />
                      <span>Generating visualizations...</span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {visualization && (
                        <>
                          {/* Demographics Impact */}
                          <div>
                            <h4 className="text-md font-medium mb-2">
                              Demographics Impact
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                              {visualization.demographics.map(
                                (item: any, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-background dark:bg-content1 p-3 rounded-lg shadow-sm dark:shadow-md flex flex-col items-center border border-default-200 dark:border-default-100/10"
                                  >
                                    <div
                                      className={`w-16 h-16 rounded-full mb-2 flex items-center justify-center text-white font-bold ${
                                        item.impact > 75
                                          ? "bg-success"
                                          : item.impact > 50
                                            ? "bg-primary"
                                            : item.impact > 25
                                              ? "bg-warning"
                                              : "bg-danger"
                                      }`}
                                    >
                                      {item.impact}%
                                    </div>
                                    <div className="font-medium">
                                      {item.group}
                                    </div>
                                    <div className="text-sm text-default-500">
                                      {item.sentiment}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* Benefits vs Challenges */}
                          <div>
                            <h4 className="text-md font-medium mb-2">
                              Benefits & Challenges
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg border border-success-200 dark:border-success-800">
                                <h5 className="text-success mb-2 font-medium">
                                  Benefits
                                </h5>
                                <ul className="list-disc pl-5 space-y-1">
                                  {visualization.benefits.map(
                                    (benefit: string, index: number) => (
                                      <li key={index}>{benefit}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                              <div className="bg-danger-50 dark:bg-danger-900/20 p-4 rounded-lg border border-danger-200 dark:border-danger-800">
                                <h5 className="text-danger mb-2 font-medium">
                                  Challenges
                                </h5>
                                <ul className="list-disc pl-5 space-y-1">
                                  {visualization.challenges.map(
                                    (challenge: string, index: number) => (
                                      <li key={index}>{challenge}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Timeline */}
                          {visualization.timeline && (
                            <div>
                              <h4 className="text-md font-medium mb-2">
                                Impact Timeline
                              </h4>
                              <div className="relative">
                                <div className="h-2 bg-default-200 dark:bg-default-700 rounded-full w-full absolute top-4"></div>
                                <div className="flex justify-between relative">
                                  {visualization.timeline.map(
                                    (stage: any, index: number) => (
                                      <div
                                        key={index}
                                        className="flex flex-col items-center relative z-10"
                                      >
                                        <div
                                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                                            stage.completed
                                              ? "bg-primary"
                                              : "bg-default-300 dark:bg-default-600"
                                          }`}
                                        >
                                          {index + 1}
                                        </div>
                                        <div className="text-center mt-2 w-24">
                                          <div className="font-medium text-sm">
                                            {stage.name}
                                          </div>
                                          <div className="text-xs text-default-500">
                                            {stage.timeframe}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Recommendations */}
                          {visualization.recommendations && (
                            <div>
                              <h4 className="text-md font-medium mb-2">
                                Recommendations
                              </h4>
                              <div className="space-y-2">
                                {visualization.recommendations.map(
                                  (rec: string, index: number) => (
                                    <div
                                      key={index}
                                      className="bg-background dark:bg-content1 p-3 rounded-lg shadow-sm dark:shadow-md border border-default-200 dark:border-default-100/10"
                                    >
                                      {rec}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {renderPostTypeDetails()}

              <div className="mt-6 text-small text-default-500">
                <p>Locality: {post.locality}</p>
              </div>
            </CardBody>

            <CardFooter className="px-10">
              <Button variant="flat" onClick={() => router.push("/posts")}>
                Back to Posts
              </Button>
            </CardFooter>
          </Card>

          {/* Discussion Thread */}
          <DiscussionThread postId={post._id} />
        </>
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
            <Button disabled={isDeleting} variant="flat" onClick={onClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

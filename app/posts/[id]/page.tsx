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
import { EventsIcon, PetitionsIcon, PollsIcon } from "@/components/Sidebar";

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
          <div className="mt-6 bg-primary-50 dark:bg-primary-900/20 p-4 md:p-5 rounded-xl border border-primary-200 dark:border-primary-800 transition-all duration-300 hover:shadow-md">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary-600 dark:text-primary-400">
              <EventsIcon />
              Event Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background/50 dark:bg-background/10 p-3 rounded-lg border border-primary-100 dark:border-primary-800/50">
                <p className="font-medium text-sm text-primary-600 dark:text-primary-400 mb-1">
                  Start Date
                </p>
                <p className="text-foreground">
                  {post.eventId?.startDate
                    ? formatDate(post.eventId.startDate)
                    : "Not specified"}
                </p>
              </div>
              <div className="bg-background/50 dark:bg-background/10 p-3 rounded-lg border border-primary-100 dark:border-primary-800/50">
                <p className="font-medium text-sm text-primary-600 dark:text-primary-400 mb-1">
                  End Date
                </p>
                <p className="text-foreground">
                  {post.eventId?.endDate
                    ? formatDate(post.eventId.endDate)
                    : "Not specified"}
                </p>
              </div>
              <div className="bg-background/50 dark:bg-background/10 p-3 rounded-lg border border-primary-100 dark:border-primary-800/50">
                <p className="font-medium text-sm text-primary-600 dark:text-primary-400 mb-1">
                  Duration
                </p>
                <p className="text-foreground flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 text-primary-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {post.eventId?.duration
                    ? `${post.eventId.duration} minutes`
                    : "Not specified"}
                </p>
              </div>
              <div className="bg-background/50 dark:bg-background/10 p-3 rounded-lg border border-primary-100 dark:border-primary-800/50">
                <p className="font-medium text-sm text-primary-600 dark:text-primary-400 mb-1">
                  Location
                </p>
                <p className="text-foreground flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 text-primary-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {post.eventId?.location || "Not specified"}
                </p>
              </div>
            </div>
          </div>
        );
      case "poll":
        return (
          <div className="mt-6 bg-secondary-50 dark:bg-secondary-900/20 p-4 md:p-5 rounded-xl border border-secondary-200 dark:border-secondary-800 transition-all duration-300 hover:shadow-md">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
              <PollsIcon />
              Poll Results
            </h3>
            <div className="space-y-3">
              {post.pollId?.options &&
                Object.entries(post.pollId.options).map(
                  ([option, votes]: [string, any], index: number) => {
                    // Calculate percentage of votes
                    const totalVotes: any = Object.values(
                      post.pollId.options
                    ).reduce((a: any, b: any) => a + b, 0);
                    const percentage =
                      totalVotes > 0
                        ? Math.round((votes / totalVotes) * 100)
                        : 0;

                    return (
                      <div
                        key={option}
                        className="bg-background/50 dark:bg-background/10 p-3 rounded-lg border border-secondary-100 dark:border-secondary-800/50"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{option}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-secondary-600 dark:text-secondary-400">
                              {votes} votes
                            </span>
                            <span className="text-sm font-bold text-secondary-600 dark:text-secondary-400">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full bg-secondary-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              {(!post.pollId?.options ||
                Object.keys(post.pollId.options).length === 0) && (
                <div className="bg-background/50 dark:bg-background/10 p-4 rounded-lg text-center border border-secondary-100 dark:border-secondary-800/50">
                  <p className="text-secondary-500 flex items-center justify-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    No poll options available
                  </p>
                </div>
              )}

              <Button
                color="secondary"
                variant="flat"
                fullWidth
                className="mt-2"
                onClick={() => router.push(`/polls/${post.pollId?._id}`)}
                endContent={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                Vote in Poll
              </Button>
            </div>
          </div>
        );
      case "petition":
        // Calculate progress percentage
        const currentSignatures = post.petitionId?.signatures || 0;
        const petitionGoal = post.petitionId?.goal || 100;
        const progressPercentage = Math.min(
          Math.floor((currentSignatures / petitionGoal) * 100),
          100
        );
        const userHasSigned = post.petitionId?.supporters?.some(
          (supporter: any) => supporter === (session?.user as any)?.id
        );

        return (
          <div className="mt-6 bg-success-50 dark:bg-success-900/20 p-4 md:p-5 rounded-xl border border-success-200 dark:border-success-800 transition-all duration-300 hover:shadow-md">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-success-600 dark:text-success-400">
              <PetitionsIcon />
              Petition
            </h3>

            <div className="bg-background/50 dark:bg-background/10 p-3 rounded-lg border border-success-100 dark:border-success-800/50 mb-4">
              <p className="font-medium text-sm text-success-600 dark:text-success-400 mb-1">
                Target
              </p>
              <p className="text-foreground">
                {post.petitionId?.target || "Not specified"}
              </p>
            </div>

            <div className="bg-background/50 dark:bg-background/10 p-3 rounded-lg border border-success-100 dark:border-success-800/50 mb-4">
              <div className="flex justify-between mb-1 items-center">
                <span className="font-medium text-foreground-600">
                  Progress
                </span>
                <div className="flex items-center gap-1 text-success-600 dark:text-success-400 font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                  </svg>
                  <span>
                    {currentSignatures} of {petitionGoal}
                  </span>
                  <span className="font-bold">({progressPercentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-success-200 dark:bg-success-700 rounded-full h-2.5 mb-2">
                <div
                  className="bg-success-500 h-2.5 rounded-full transition-all duration-700 ease-in-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-success-600 dark:text-success-400 text-center">
                {petitionGoal - currentSignatures > 0
                  ? `${petitionGoal - currentSignatures} more signatures needed`
                  : "Goal reached! Thank you for your support."}
              </p>
            </div>

            <Button
              color="success"
              fullWidth
              isDisabled={userHasSigned || !session}
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
              startContent={
                userHasSigned ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.08l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                  </svg>
                )
              }
            >
              {userHasSigned
                ? "You've Signed This Petition"
                : session
                  ? "Sign This Petition"
                  : "Sign in to Support"}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-8 px-3 sm:px-6">
      {post && (
        <>
          <Card className="w-full mb-6 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-col gap-2 px-4 sm:px-6 md:px-10 pt-6 pb-4">
              {/* Post Title and Actions Row */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start w-full gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground line-clamp-2 mb-2">
                    {post.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Chip color="default" variant="flat" className="capitalize">
                      {post.type}
                    </Chip>
                    <Chip
                      color={getPriorityColor(post.priority) as any}
                      size="sm"
                      variant="flat"
                      className="capitalize"
                    >
                      {post.priority} priority
                    </Chip>
                  </div>
                </div>

                {/* Action buttons - visible on all screen sizes */}
                <div className="md:flex md:flex-wrap grid grid-cols-2 gap-2 justify-end">
                  <Button
                    color="secondary"
                    startContent={<SparkleIcon />}
                    onPress={() => handleSummarize()}
                    isDisabled={summarizing || !!summary}
                    size="sm"
                  >
                    Summarize
                  </Button>
                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<ChartIcon />}
                    onPress={handleVisualizeImpact}
                    isDisabled={visualizing || !!visualization}
                    size="sm"
                  >
                    Visualize
                  </Button>
                  {(isAuthor || isModeratorOrAdmin) && (
                    <>
                      {isAuthor && (
                        <Button
                          color="primary"
                          onPress={() => router.push(`/posts/${post._id}/edit`)}
                          size="sm"
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="flat"
                        color="danger"
                        onPress={onOpen}
                        size="sm"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Divider className="my-3" />

              {/* Author Info */}
              <div className="flex items-center gap-3 mr-auto">
                <Avatar
                  name={post.createdBy?.name || "User"}
                  showFallback
                  fallback={getInitials(post.createdBy?.name || "User")}
                  size="md"
                  className="bg-primary-100 text-primary-600"
                />
                <div>
                  <p className="font-semibold text-base md:text-lg text-foreground">
                    {post.createdBy?.name}
                  </p>
                  <p className="text-default-500 text-xs md:text-sm">
                    Posted on {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="px-4 sm:px-6 md:px-10 py-4 md:py-6">
              {/* Main Content */}
              <div className="prose max-w-none mb-6">
                <p className="whitespace-pre-line leading-relaxed text-foreground-600">
                  {post.description}
                </p>
              </div>

              {/* Summary section with improved visual design */}
              {(summarizing || summary) && (
                <div className="mt-6 bg-secondary-50 dark:bg-secondary-900/20 p-4 md:p-5 rounded-xl border border-secondary-200 dark:border-secondary-800 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <SparkleIcon />
                      <h3 className="text-lg font-semibold text-secondary-600 dark:text-secondary-400">
                        AI Summary
                      </h3>
                    </div>
                    {summary && (
                      <Button
                        size="sm"
                        color="secondary"
                        variant="flat"
                        startContent={<AudioIcon isPlaying={isPlaying} />}
                        onClick={handleVoicePlayback}
                        isDisabled={summarizing}
                        className="min-w-[80px]"
                      >
                        {isPlaying ? "Stop" : "Play"}
                      </Button>
                    )}
                  </div>
                  {summarizing ? (
                    <div className="flex items-center gap-2 py-4">
                      <Spinner size="sm" color="secondary" />
                      <span className="text-secondary-600 dark:text-secondary-400">
                        Generating summary...
                      </span>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-line text-foreground-600 leading-relaxed">
                        {summary}
                      </p>
                      {speechError && (
                        <div className="mt-2 p-2 bg-danger-50 dark:bg-danger-900/20 rounded-lg border border-danger-200 dark:border-danger-800">
                          <p className="text-danger text-sm flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {speechError}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Visualization section with improved design */}
              {(visualizing || visualization) && (
                <div className="mt-6 bg-primary-50 dark:bg-primary-950/20 p-4 md:p-5 rounded-xl border border-primary-200 dark:border-primary-800 transition-all duration-300">
                  <div className="flex items-center mb-3">
                    <ChartIcon />
                    <h3 className="text-lg font-semibold text-primary-600 dark:text-primary-400 ml-2">
                      Community Impact
                    </h3>
                  </div>
                  {visualizing ? (
                    <div className="flex items-center gap-2 py-4">
                      <Spinner size="sm" color="primary" />
                      <span className="text-primary-600 dark:text-primary-400">
                        Generating visualizations...
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {visualization && (
                        <>
                          {/* Demographics Impact */}
                          <div
                            className="animate-fadeIn"
                            style={{ animationDelay: "0.1s" }}
                          >
                            <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-5 h-5 text-primary-500"
                              >
                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                              </svg>
                              Demographics Impact
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                              {visualization.demographics.map(
                                (item: any, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-background dark:bg-content1 p-3 rounded-lg shadow-sm hover:shadow-md dark:shadow-md flex flex-col items-center border border-default-200 dark:border-default-100/10 transition-all duration-300 hover:translate-y-[-2px]"
                                  >
                                    <div
                                      className={`w-14 h-14 md:w-16 md:h-16 rounded-full mb-2 flex items-center justify-center text-white font-bold text-sm md:text-base ${
                                        item.impact > 75
                                          ? "bg-success-500"
                                          : item.impact > 50
                                            ? "bg-primary-500"
                                            : item.impact > 25
                                              ? "bg-warning-500"
                                              : "bg-danger-500"
                                      }`}
                                    >
                                      {item.impact}%
                                    </div>
                                    <div className="font-medium text-center text-sm md:text-base truncate w-full">
                                      {item.group}
                                    </div>
                                    <div className="text-xs md:text-sm text-default-500 text-center">
                                      {item.sentiment}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* Benefits vs Challenges */}
                          <div
                            className="animate-fadeIn"
                            style={{ animationDelay: "0.3s" }}
                          >
                            <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-5 h-5 text-primary-500"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M13.5 4.938a7 7 0 11-9.06 1.56a.75.75 0 111.06-1.06 5.5 5.5 0 107.12-1.22.75.75 0 111.06-1.06c-.262.218-.526.431-.79.64zM5.87 10.578a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm1.31-3.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm1.37 1.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 11.078a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm-2-3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Benefits & Challenges
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg border border-success-200 dark:border-success-800 hover:shadow-md transition-all duration-300">
                                <h5 className="text-success-600 dark:text-success-400 mb-2 font-medium flex items-center gap-2">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-5 h-5"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Benefits
                                </h5>
                                <ul className="list-disc pl-5 space-y-1 text-sm md:text-base">
                                  {visualization.benefits.map(
                                    (benefit: string, index: number) => (
                                      <li
                                        key={index}
                                        className="text-foreground-600"
                                      >
                                        {benefit}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                              <div className="bg-danger-50 dark:bg-danger-900/20 p-4 rounded-lg border border-danger-200 dark:border-danger-800 hover:shadow-md transition-all duration-300">
                                <h5 className="text-danger-600 dark:text-danger-400 mb-2 font-medium flex items-center gap-2">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-5 h-5"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Challenges
                                </h5>
                                <ul className="list-disc pl-5 space-y-1 text-sm md:text-base">
                                  {visualization.challenges.map(
                                    (challenge: string, index: number) => (
                                      <li
                                        key={index}
                                        className="text-foreground-600"
                                      >
                                        {challenge}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Timeline */}
                          {visualization.timeline && (
                            <div
                              className="animate-fadeIn"
                              style={{ animationDelay: "0.5s" }}
                            >
                              <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="w-5 h-5 text-primary-500"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Impact Timeline
                              </h4>
                              <div className="relative mt-6 md:mt-8 py-2">
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
                                              ? "bg-primary-500 shadow-lg shadow-primary-200 dark:shadow-primary-900/20"
                                              : "bg-default-300 dark:bg-default-600"
                                          } transition-all duration-300 hover:scale-110`}
                                        >
                                          {index + 1}
                                        </div>
                                        <div className="text-center mt-3 w-20 sm:w-24">
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
                            <div
                              className="animate-fadeIn"
                              style={{ animationDelay: "0.7s" }}
                            >
                              <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="w-5 h-5 text-primary-500"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 2a.75.75 0 01.75.75v.54l1.838-.46a.75.75 0 11.364 1.46l-2.077.52.919 3.678a.75.75 0 01-1.45.36l-.919-3.678-1.5.37a.75.75 0 01-.364-1.46l2.12-.53V2.75A.75.75 0 0110 2zM2.93 9.412a.75.75 0 01.97.423l.52 1.66 2.077-.52a.75.75 0 01.363 1.46l-2.718.68a.75.75 0 01-.9-.485L2.74 10.4a.75.75 0 01.19-.988zm13.14.423a.75.75 0 01.97-.423.75.75 0 01.192.988l-.5 1.657a.75.75 0 01-.498.498l-2.72.68a.75.75 0 01-.362-1.46l2.077-.52.52-1.66zM6.67 14.41a.75.75 0 01.364-1.46l2.12-.53.919 3.678a.75.75 0 01-1.45.36l-.92-3.678-1.5.37a.75.75 0 01-.364-1.46l2.12-.53.617 2.46a.75.75 0 11-1.45.36l-.617-2.46zM10.75 8.91v.531l1.838-.46a.75.75 0 01.364 1.46l-2.077.52.919 3.678a.75.75 0 01-1.45.36l-.919-3.678-1.5.37a.75.75 0 01-.364-1.46l2.12-.53V8.91a.75.75 0 011.5 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Action Recommendations
                              </h4>
                              <div className="grid grid-cols-1 gap-2">
                                {visualization.recommendations.map(
                                  (rec: string, index: number) => (
                                    <div
                                      key={index}
                                      className="bg-background dark:bg-content1 p-3 rounded-lg shadow-sm dark:shadow-md border border-default-200 dark:border-default-100/10 hover:border-primary hover:shadow-md transition-all duration-300 flex items-start gap-3"
                                    >
                                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                                        {index + 1}
                                      </div>
                                      <p className="text-foreground-600 text-sm md:text-base">
                                        {rec}
                                      </p>
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

              {/* Post Type Details with improved styling */}
              {renderPostTypeDetails()}

              {/* Location Info with icon */}
              <div className="mt-6 flex items-center text-sm text-default-500 gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>
                  Locality: <span className="font-medium">{post.locality}</span>
                </p>
              </div>
            </CardBody>

            <CardFooter className="px-4 sm:px-6 md:px-10 py-4 flex flex-wrap gap-2 justify-between">
              <Button
                variant="flat"
                onClick={() => router.push("/posts")}
                startContent={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                Back to Posts
              </Button>

              <Button
                color="primary"
                variant="flat"
                endContent={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                  </svg>
                }
                onClick={() => {
                  const shareData = {
                    title: post.title,
                    text: `Check out this post: ${post.title}`,
                    url: window.location.href,
                  };

                  if (navigator.share && navigator.canShare(shareData)) {
                    navigator.share(shareData);
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    // You could add a toast notification here
                  }
                }}
              >
                Share
              </Button>
            </CardFooter>
          </Card>

          {/* Discussion Thread */}
          <div className="mb-16">
            <DiscussionThread postId={post._id} />
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        backdrop="blur"
        classNames={{
          base: "border border-danger-200 dark:border-danger-800 shadow-xl",
          backdrop: "bg-danger/10 backdrop-opacity-30",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-danger-500">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                  clipRule="evenodd"
                />
              </svg>
              Delete Post
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="bg-danger-50 dark:bg-danger-900/20 p-3 rounded-lg border border-danger-200 dark:border-danger-800 mb-2">
              <p className="text-danger-600 dark:text-danger-400 font-medium mb-1 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                Warning
              </p>
              <p className="text-foreground-600">
                This action cannot be undone. This will permanently delete the
                post and all associated discussions.
              </p>
            </div>
            <p className="text-sm text-default-500">
              Are you sure you want to delete &quot;
              <span className="font-medium">{post?.title}</span>
              &quot;?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              disabled={isDeleting}
              variant="flat"
              onClick={onClose}
              startContent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            >
              Cancel
            </Button>
            <Button
              color="danger"
              isLoading={isDeleting}
              onClick={handleDelete}
              startContent={
                !isDeleting && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                )
              }
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add global CSS animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

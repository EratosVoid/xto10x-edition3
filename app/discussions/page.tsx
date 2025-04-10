"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Textarea } from "@heroui/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Divider } from "@heroui/divider";
import { useSession } from "next-auth/react";

// Simulated discussion data
const dummyDiscussions = [
  {
    id: "1",
    title: "Traffic Safety Improvements on Oak Street",
    content:
      "I've noticed a lot of speeding on Oak Street near the elementary school. What can we do as a community to improve safety for our children walking to school?",
    createdBy: {
      id: "user1",
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    createdAt: "2023-07-15T08:24:00",
    category: "safety",
    locality: "Downtown",
    responses: [
      {
        id: "r1a",
        content:
          "I agree! I think we should petition for speed bumps and increased signage.",
        createdBy: {
          id: "user2",
          name: "Mike Peterson",
          avatar: "https://i.pravatar.cc/150?img=2",
        },
        createdAt: "2023-07-15T09:45:00",
        likes: 8,
      },
      {
        id: "r1b",
        content:
          "We could also organize a community speed watch program with the police department.",
        createdBy: {
          id: "user3",
          name: "Emily Davis",
          avatar: "https://i.pravatar.cc/150?img=3",
        },
        createdAt: "2023-07-15T10:15:00",
        likes: 5,
      },
      {
        id: "r1c",
        content:
          "I spoke with Principal Watson and she's also concerned. The school would support any safety initiatives.",
        createdBy: {
          id: "user4",
          name: "Thomas Wilson",
          avatar: "https://i.pravatar.cc/150?img=4",
        },
        createdAt: "2023-07-15T13:30:00",
        likes: 12,
      },
    ],
    views: 87,
    likes: 24,
  },
  {
    id: "2",
    title: "Ideas for the Annual Community Festival",
    content:
      "The community festival is coming up in two months. What activities or events would you all like to see this year?",
    createdBy: {
      id: "user5",
      name: "Jennifer Adams",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    createdAt: "2023-07-10T15:30:00",
    category: "events",
    locality: "Downtown",
    responses: [
      {
        id: "r2a",
        content:
          "I'd love to see more local food vendors participating this year.",
        createdBy: {
          id: "user6",
          name: "Robert Chen",
          avatar: "https://i.pravatar.cc/150?img=6",
        },
        createdAt: "2023-07-10T16:45:00",
        likes: 19,
      },
      {
        id: "r2b",
        content:
          "How about a community talent show? We have so many talented people here.",
        createdBy: {
          id: "user7",
          name: "Amanda King",
          avatar: "https://i.pravatar.cc/150?img=7",
        },
        createdAt: "2023-07-11T08:20:00",
        likes: 15,
      },
    ],
    views: 112,
    likes: 31,
  },
  {
    id: "3",
    title: "Farmers Market Expansion Proposal",
    content:
      "I've been talking with several local farmers who would like to join our Saturday market. Should we expand to accommodate more vendors?",
    createdBy: {
      id: "user8",
      name: "David Martinez",
      avatar: "https://i.pravatar.cc/150?img=8",
    },
    createdAt: "2023-07-05T11:20:00",
    category: "business",
    locality: "Eastside",
    responses: [
      {
        id: "r3a",
        content: "Absolutely! More vendors means more variety for shoppers.",
        createdBy: {
          id: "user9",
          name: "Lisa Thompson",
          avatar: "https://i.pravatar.cc/150?img=9",
        },
        createdAt: "2023-07-05T12:30:00",
        likes: 14,
      },
      {
        id: "r3b",
        content:
          "I'm concerned about parking. If we expand, we should consider alternative parking options.",
        createdBy: {
          id: "user10",
          name: "James Wilson",
          avatar: "https://i.pravatar.cc/150?img=10",
        },
        createdAt: "2023-07-05T13:15:00",
        likes: 8,
      },
      {
        id: "r3c",
        content:
          "We could expand into the adjacent park area on a trial basis to see how it goes.",
        createdBy: {
          id: "user11",
          name: "Karen Lewis",
          avatar: "https://i.pravatar.cc/150?img=11",
        },
        createdAt: "2023-07-06T09:45:00",
        likes: 21,
      },
    ],
    views: 143,
    likes: 42,
  },
  {
    id: "4",
    title: "Community Garden Planning Committee",
    content:
      "We received approval for the community garden project! Looking for volunteers to join the planning committee.",
    createdBy: {
      id: "user12",
      name: "Paul Harrison",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    createdAt: "2023-07-08T10:00:00",
    category: "environment",
    locality: "Westside",
    responses: [
      {
        id: "r4a",
        content: "I'd love to help! I have experience with urban gardening.",
        createdBy: {
          id: "user13",
          name: "Michelle Patel",
          avatar: "https://i.pravatar.cc/150?img=13",
        },
        createdAt: "2023-07-08T10:45:00",
        likes: 7,
      },
      {
        id: "r4b",
        content: "When is the first meeting scheduled? I'd like to join.",
        createdBy: {
          id: "user14",
          name: "Daniel Wright",
          avatar: "https://i.pravatar.cc/150?img=14",
        },
        createdAt: "2023-07-08T11:30:00",
        likes: 3,
      },
    ],
    views: 76,
    likes: 19,
  },
];

// Category options with color mapping
const categories = [
  { value: "all", label: "All Topics", color: "default" },
  { value: "safety", label: "Safety", color: "warning" },
  { value: "events", label: "Events", color: "primary" },
  { value: "business", label: "Business", color: "success" },
  { value: "environment", label: "Environment", color: "secondary" },
  { value: "education", label: "Education", color: "danger" },
  { value: "infrastructure", label: "Infrastructure", color: "default" },
];

// Get category color
const getCategoryColor = (category: string) => {
  const found = categories.find((c) => c.value === category);
  return found ? found.color : "default";
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return (
      "Today at " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  } else if (diffDays === 1) {
    return (
      "Yesterday at " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  } else if (diffDays < 7) {
    return diffDays + " days ago";
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
};

export default function DiscussionsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedDiscussion, setExpandedDiscussion] = useState<string | null>(
    null
  );
  const [replyContent, setReplyContent] = useState("");

  // Filter discussions based on search and category
  const filteredDiscussions = dummyDiscussions.filter((discussion) => {
    const matchesSearch =
      discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || discussion.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle expanding/collapsing discussions
  const toggleDiscussion = (id: string) => {
    if (expandedDiscussion === id) {
      setExpandedDiscussion(null);
    } else {
      setExpandedDiscussion(id);
    }
  };

  // Handle reply submission
  const handleReply = (discussionId: string) => {
    if (!replyContent.trim() || status !== "authenticated") {
      if (status !== "authenticated") {
        router.push("/login?callbackUrl=/discussions");
      }
      return;
    }

    // In a real app, this would post to an API
    console.log(`Replying to discussion ${discussionId}: ${replyContent}`);

    // Clear the reply input
    setReplyContent("");
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Community Discussions</h1>
          <p className="text-default-500">
            Join conversations about topics that matter to your neighborhood
          </p>
        </div>
        <Button
          color="primary"
          className="mt-4 md:mt-0"
          onClick={() => router.push("/discussions/create")}
        >
          Start a Discussion
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="my-6">
        <Input
          placeholder="Search discussions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        {/* Category tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => (
            <Chip
              key={category.value}
              color={
                category.value === selectedCategory
                  ? (category.color as any)
                  : "default"
              }
              variant={category.value === selectedCategory ? "solid" : "flat"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Discussion Cards */}
      <div className="grid grid-cols-1 gap-6 mt-8">
        {filteredDiscussions.length > 0 ? (
          filteredDiscussions.map((discussion) => {
            const isExpanded = expandedDiscussion === discussion.id;

            return (
              <Card key={discussion.id} className="w-full">
                <CardHeader className="flex flex-col">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <Avatar
                        src={discussion.createdBy.avatar}
                        name={discussion.createdBy.name}
                        size="sm"
                      />
                      <div>
                        <h3 className="text-xl font-bold">
                          {discussion.title}
                        </h3>
                        <p className="text-small text-default-500">
                          By {discussion.createdBy.name} •{" "}
                          {formatDate(discussion.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Chip
                      color={getCategoryColor(discussion.category) as any}
                      variant="flat"
                    >
                      {discussion.category.charAt(0).toUpperCase() +
                        discussion.category.slice(1)}
                    </Chip>
                  </div>
                </CardHeader>

                <CardBody>
                  <p className="mb-4">{discussion.content}</p>

                  <div className="flex justify-between items-center text-small text-default-500 mt-4">
                    <div className="flex gap-4">
                      <span>{discussion.views} views</span>
                      <span>{discussion.likes} likes</span>
                      <span>{discussion.responses.length} responses</span>
                    </div>
                    <span>Locality: {discussion.locality}</span>
                  </div>

                  {isExpanded && (
                    <div className="mt-6">
                      <Divider className="my-3" />
                      <p className="text-medium font-semibold mb-4">
                        Responses
                      </p>

                      {discussion.responses.map((response) => (
                        <div
                          key={response.id}
                          className="mb-4 pb-4 border-b border-default-100 last:border-0"
                        >
                          <div className="flex gap-3 items-start">
                            <Avatar
                              src={response.createdBy.avatar}
                              name={response.createdBy.name}
                              size="sm"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className="font-semibold">
                                  {response.createdBy.name}
                                </p>
                                <p className="text-tiny text-default-500">
                                  {formatDate(response.createdAt)}
                                </p>
                              </div>
                              <p className="mt-1">{response.content}</p>
                              <div className="flex items-center mt-2 gap-2">
                                <Button
                                  size="sm"
                                  variant="light"
                                  className="text-tiny text-default-500"
                                >
                                  👍 {response.likes}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="light"
                                  className="text-tiny text-default-500"
                                >
                                  Reply
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Reply input */}
                      {status === "authenticated" ? (
                        <div className="mt-4">
                          <div className="flex gap-3 items-start">
                            <Avatar
                              src={
                                session?.user?.image ||
                                "https://i.pravatar.cc/150?img=0"
                              }
                              name={session?.user?.name || "You"}
                              size="sm"
                            />
                            <div className="flex-1">
                              <Textarea
                                placeholder="Add a response..."
                                value={replyContent}
                                onChange={(e) =>
                                  setReplyContent(e.target.value)
                                }
                                className="w-full"
                                minRows={2}
                              />
                              <div className="flex justify-end mt-2">
                                <Button
                                  color="primary"
                                  size="sm"
                                  isDisabled={!replyContent.trim()}
                                  onClick={() => handleReply(discussion.id)}
                                >
                                  Post Response
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 bg-default-50 rounded-lg text-center">
                          <p className="text-default-500">
                            <Button
                              as="a"
                              color="primary"
                              variant="flat"
                              href="/login?callbackUrl=/discussions"
                            >
                              Sign in
                            </Button>{" "}
                            to join the conversation
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardBody>

                <CardFooter className="flex justify-between">
                  <Button
                    color="primary"
                    variant="flat"
                    onClick={() => router.push(`/discussions/${discussion.id}`)}
                  >
                    View Full Discussion
                  </Button>

                  <Button
                    color="primary"
                    variant={isExpanded ? "solid" : "light"}
                    onClick={() => toggleDiscussion(discussion.id)}
                  >
                    {isExpanded ? "Hide Responses" : "Show Responses"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-default-50 rounded-lg">
            <p className="text-xl font-semibold mb-2">No discussions found</p>
            <p className="text-default-500 text-center mb-6">
              We couldn&apos;t find any discussions matching your criteria.
            </p>
            <Button
              color="primary"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

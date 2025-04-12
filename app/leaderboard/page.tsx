"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@heroui/avatar";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Badge } from "@heroui/badge";
import { Progress } from "@heroui/progress";

// Mock users data for leaderboard
const users = [
  {
    id: 1,
    name: "Sarah Johnson",
    username: "sarah_j",
    image: "https://i.pravatar.cc/150?img=1",
    points: 720,
    rank: 1,
    awards: 12,
    contributions: {
      posts: 28,
      comments: 94,
      events: 5,
      petitions: 3,
    },
    trend: "up",
    isCurrentUser: false,
  },
  {
    id: 2,
    name: "Michael Lee",
    username: "mike_lee",
    image: "https://i.pravatar.cc/150?img=2",
    points: 615,
    rank: 2,
    awards: 8,
    contributions: {
      posts: 19,
      comments: 73,
      events: 7,
      petitions: 2,
    },
    trend: "up",
    isCurrentUser: false,
  },
  {
    id: 3,
    name: "Emily Garcia",
    username: "em_garcia",
    image: "https://i.pravatar.cc/150?img=3",
    points: 580,
    rank: 3,
    awards: 7,
    contributions: {
      posts: 15,
      comments: 62,
      events: 9,
      petitions: 1,
    },
    trend: "down",
    isCurrentUser: false,
  },
  {
    id: 4,
    name: "David Wilson",
    username: "david_w",
    image: "https://i.pravatar.cc/150?img=4",
    points: 510,
    rank: 4,
    awards: 6,
    contributions: {
      posts: 12,
      comments: 58,
      events: 6,
      petitions: 0,
    },
    trend: "same",
    isCurrentUser: false,
  },
  {
    id: 5,
    name: "Current User",
    username: "current_user",
    image: "https://i.pravatar.cc/150?img=5",
    points: 485,
    rank: 5,
    awards: 5,
    contributions: {
      posts: 11,
      comments: 52,
      events: 4,
      petitions: 2,
    },
    trend: "up",
    isCurrentUser: true,
  },
  {
    id: 6,
    name: "Alex Patel",
    username: "alex_p",
    image: "https://i.pravatar.cc/150?img=6",
    points: 450,
    rank: 6,
    awards: 5,
    contributions: {
      posts: 14,
      comments: 41,
      events: 2,
      petitions: 3,
    },
    trend: "down",
    isCurrentUser: false,
  },
  {
    id: 7,
    name: "Olivia Martinez",
    username: "olivia_m",
    image: "https://i.pravatar.cc/150?img=7",
    points: 425,
    rank: 7,
    awards: 4,
    contributions: {
      posts: 10,
      comments: 45,
      events: 3,
      petitions: 1,
    },
    trend: "up",
    isCurrentUser: false,
  },
  {
    id: 8,
    name: "James Taylor",
    username: "james_t",
    image: "https://i.pravatar.cc/150?img=8",
    points: 390,
    rank: 8,
    awards: 3,
    contributions: {
      posts: 8,
      comments: 42,
      events: 2,
      petitions: 2,
    },
    trend: "same",
    isCurrentUser: false,
  },
  {
    id: 9,
    name: "Sophia Kim",
    username: "sophia_k",
    image: "https://i.pravatar.cc/150?img=9",
    points: 365,
    rank: 9,
    awards: 4,
    contributions: {
      posts: 9,
      comments: 36,
      events: 2,
      petitions: 1,
    },
    trend: "up",
    isCurrentUser: false,
  },
  {
    id: 10,
    name: "Daniel Brown",
    username: "dan_b",
    image: "https://i.pravatar.cc/150?img=10",
    points: 320,
    rank: 10,
    awards: 2,
    contributions: {
      posts: 7,
      comments: 34,
      events: 1,
      petitions: 1,
    },
    trend: "down",
    isCurrentUser: false,
  },
];

// Trend icons
const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") {
    return (
      <span className="text-success-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  } else if (trend === "down") {
    return (
      <span className="text-danger-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-1.025.275l-4.287-2.475a.75.75 0 01.75-1.3l2.71 1.565a19.422 19.422 0 00-3.013-6.024L7.53 11.533a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  } else {
    return (
      <span className="text-default-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M8 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
          <path d="M3.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
          <path d="M13.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
        </svg>
      </span>
    );
  }
};

// Rank badges with different colors
const RankBadge = ({ rank }: { rank: number }) => {
  let bgColor = "";
  let textColor = "";

  if (rank === 1) {
    bgColor = "bg-warning-100";
    textColor = "text-warning-600";
  } else if (rank === 2) {
    bgColor = "bg-default-100";
    textColor = "text-default-600";
  } else if (rank === 3) {
    bgColor = "bg-danger-100";
    textColor = "text-danger-600";
  } else {
    bgColor = "bg-primary-100";
    textColor = "text-primary-600";
  }

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${bgColor} ${textColor}`}
    >
      {rank}
    </div>
  );
};

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [selectedTab, setSelectedTab] = useState("all-time");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Get current user's position
  const currentUser = users.find((user) => user.isCurrentUser);

  // Filter users based on category
  const getFilteredUsers = () => {
    return users;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Community Leaderboard</h1>
          <p className="text-default-500">
            See the top contributors in your local community
          </p>
        </div>
        <Chip color="primary" variant="flat" className="px-3">
          Preview Feature
        </Chip>
      </div>

      {/* User's current standing */}
      {currentUser && (
        <Card className="border border-divider bg-primary-50 dark:bg-primary-900/20 mb-8">
          <CardBody>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8">
              <div className="flex items-center">
                <RankBadge rank={currentUser.rank} />
                <div className="ml-4">
                  <h3 className="text-xl font-bold">Your Ranking</h3>
                  <p className="text-primary-600 text-sm">
                    #{currentUser.rank} of {users.length} contributors
                  </p>
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">
                    Progress to Next Rank
                  </span>
                  <span className="text-xs font-medium text-primary-600">
                    {currentUser.points} pts
                  </span>
                </div>
                <Progress value={85} color="primary" className="h-2 mb-2" />
                <p className="text-xs text-primary-600">
                  35 points until you reach rank #{currentUser.rank - 1}
                </p>
              </div>

              <div className="flex flex-col items-center md:items-end gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Trend</span>
                  <TrendIcon trend={currentUser.trend} />
                </div>
                <div className="flex items-center gap-2">
                  <Badge color="primary" variant="flat">
                    {currentUser.contributions.posts} Posts
                  </Badge>
                  <Badge color="success" variant="flat">
                    {currentUser.awards} Awards
                  </Badge>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Filters and tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          variant="underlined"
          size="md"
        >
          <Tab key="all-time" title="All Time" />
          <Tab key="this-month" title="This Month" />
          <Tab key="this-week" title="This Week" />
        </Tabs>

        <div className="w-full md:w-48">
          <Select
            label="Contribution Type"
            placeholder="Select type"
            selectedKeys={[selectedCategory]}
            onChange={(e) => setSelectedCategory(e.target.value)}
            size="sm"
          >
            <SelectItem key="all" textValue="all">
              All Contributions
            </SelectItem>
            <SelectItem key="posts" textValue="posts">
              Posts
            </SelectItem>
            <SelectItem key="comments" textValue="comments">
              Comments
            </SelectItem>
            <SelectItem key="events" textValue="events">
              Events
            </SelectItem>
            <SelectItem key="petitions" textValue="petitions">
              Petitions
            </SelectItem>
          </Select>
        </div>
      </div>

      {/* Leaderboard */}
      <Card className="border border-divider mb-8">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-default-50 dark:bg-default-100/20 text-default-700">
                  <th className="py-3 px-4 text-left font-medium text-sm">
                    Rank
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-sm">
                    Member
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-sm">
                    Points
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-sm">
                    Trend
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-sm">
                    Awards
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-sm">
                    Contributions
                  </th>
                  <th className="py-3 px-4 text-right font-medium text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {getFilteredUsers().map((user) => (
                  <tr
                    key={user.id}
                    className={
                      user.isCurrentUser
                        ? "bg-primary-50/50 dark:bg-primary-900/10"
                        : ""
                    }
                  >
                    <td className="py-3 px-4">
                      <RankBadge rank={user.rank} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.image}
                          name={user.name}
                          size="sm"
                          isBordered={user.isCurrentUser}
                          color={user.isCurrentUser ? "primary" : "default"}
                        />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-default-500">
                            @{user.username}
                          </p>
                        </div>
                        {user.isCurrentUser && (
                          <Badge
                            color="primary"
                            size="sm"
                            variant="flat"
                            className="ml-2"
                          >
                            You
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{user.points}</td>
                    <td className="py-3 px-4">
                      <TrendIcon trend={user.trend} />
                    </td>
                    <td className="py-3 px-4">
                      <Badge color="success" variant="flat">
                        {user.awards}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        <Badge color="default" variant="flat" size="sm">
                          {user.contributions.posts} posts
                        </Badge>
                        <Badge color="default" variant="flat" size="sm">
                          {user.contributions.comments} comments
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button size="sm" variant="flat" color="primary">
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* How points are earned */}
      <Card className="border border-divider">
        <CardHeader>
          <h3 className="text-xl font-semibold">How Points Are Earned</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-divider rounded-lg p-4">
              <h4 className="font-medium mb-2">Content Creation</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Creating a post</span>
                  <span className="font-semibold">5 pts</span>
                </li>
                <li className="flex justify-between">
                  <span>Organizing an event</span>
                  <span className="font-semibold">15 pts</span>
                </li>
                <li className="flex justify-between">
                  <span>Starting a petition</span>
                  <span className="font-semibold">10 pts</span>
                </li>
                <li className="flex justify-between">
                  <span>Creating a poll</span>
                  <span className="font-semibold">7 pts</span>
                </li>
              </ul>
            </div>

            <div className="border border-divider rounded-lg p-4">
              <h4 className="font-medium mb-2">Engagement</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Commenting on a post</span>
                  <span className="font-semibold">2 pts</span>
                </li>
                <li className="flex justify-between">
                  <span>Upvoting content</span>
                  <span className="font-semibold">1 pt</span>
                </li>
                <li className="flex justify-between">
                  <span>Sharing a post</span>
                  <span className="font-semibold">3 pts</span>
                </li>
                <li className="flex justify-between">
                  <span>Participating in an event</span>
                  <span className="font-semibold">5 pts</span>
                </li>
              </ul>
            </div>

            <div className="border border-divider rounded-lg p-4">
              <h4 className="font-medium mb-2">Recognition</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Receiving an award</span>
                  <span className="font-semibold">10-25 pts</span>
                </li>
                <li className="flex justify-between">
                  <span>Post gets featured</span>
                  <span className="font-semibold">20 pts</span>
                </li>
                <li className="flex justify-between">
                  <span>Verified solution</span>
                  <span className="font-semibold">15 pts</span>
                </li>
                <li className="flex justify-between">
                  <span>Completing a challenge</span>
                  <span className="font-semibold">25 pts</span>
                </li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

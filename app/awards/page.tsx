"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";

// Award types with data
const awards = [
  {
    id: "helpful",
    name: "Helpful",
    emoji: "🏆",
    description:
      "Awarded to community members who consistently provide valuable assistance to others.",
    color: "primary",
    count: 7,
    received: true,
    unlocked: true,
  },
  {
    id: "green",
    name: "Green Initiative",
    emoji: "🌱",
    description:
      "Recognizes contributions to environmental sustainability within the community.",
    color: "success",
    count: 3,
    received: true,
    unlocked: true,
  },
  {
    id: "star",
    name: "Rising Star",
    emoji: "⭐",
    description:
      "Recognizes new members who have made a significant impact in a short time.",
    color: "warning",
    count: 2,
    received: true,
    unlocked: true,
  },
  {
    id: "unity",
    name: "Unity Builder",
    emoji: "🤝",
    description:
      "Awarded for bringing community members together and fostering collaboration.",
    color: "secondary",
    count: 4,
    received: true,
    unlocked: true,
  },
  {
    id: "innovator",
    name: "Innovator",
    emoji: "💡",
    description:
      "Recognizes creative solutions and innovative ideas that benefit the community.",
    color: "primary",
    count: 1,
    received: true,
    unlocked: true,
  },
  {
    id: "voice",
    name: "Community Voice",
    emoji: "🔊",
    description:
      "Celebrates those who effectively represent and amplify community concerns.",
    color: "danger",
    count: 0,
    received: false,
    unlocked: true,
  },
  {
    id: "guardian",
    name: "Neighborhood Guardian",
    emoji: "🛡️",
    description:
      "Awarded for contributions to community safety and security initiatives.",
    color: "secondary",
    count: 0,
    received: false,
    unlocked: true,
  },
  {
    id: "mentor",
    name: "Mentor",
    emoji: "👨‍🏫",
    description:
      "Recognizes members who help educate and guide others in the community.",
    color: "success",
    count: 0,
    received: false,
    unlocked: true,
  },
  {
    id: "legacy",
    name: "Legacy Builder",
    emoji: "🏛️",
    description:
      "Awarded for long-term contributions that have lasting impact on the community.",
    color: "warning",
    count: 0,
    received: false,
    unlocked: false,
  },
  {
    id: "champion",
    name: "Community Champion",
    emoji: "🏅",
    description:
      "The highest honor, awarded to those who exemplify exceptional community leadership.",
    color: "danger",
    count: 0,
    received: false,
    unlocked: false,
  },
];

// Mock award activity data
const awardActivity = [
  {
    id: 1,
    awardId: "helpful",
    awardName: "Helpful",
    emoji: "🏆",
    color: "primary",
    fromUser: {
      name: "Michael Lee",
      image: "https://i.pravatar.cc/150?img=2",
    },
    note: "Thanks for your detailed response about local recycling programs. It helped me get started!",
    timestamp: "2 days ago",
  },
  {
    id: 2,
    awardId: "green",
    awardName: "Green Initiative",
    emoji: "🌱",
    color: "success",
    fromUser: {
      name: "Emily Garcia",
      image: "https://i.pravatar.cc/150?img=3",
    },
    note: "Your park cleanup event was amazing! You've inspired me to start my own initiative.",
    timestamp: "1 week ago",
  },
  {
    id: 3,
    awardId: "star",
    awardName: "Rising Star",
    emoji: "⭐",
    color: "warning",
    fromUser: {
      name: "Community Admin",
      image: "/images/admin-avatar.png",
    },
    note: "For your outstanding contributions in your first month as a community member.",
    timestamp: "2 weeks ago",
  },
];

export default function AwardsPage() {
  const { data: session } = useSession();
  const [selectedTab, setSelectedTab] = useState("my-awards");

  // Colors for award backgrounds based on color prop
  const getBgColor = (color: string, received: boolean) => {
    if (!received) return "bg-default-100 text-default-500";

    switch (color) {
      case "primary":
        return "bg-primary-100 text-primary-500";
      case "success":
        return "bg-success-100 text-success-500";
      case "warning":
        return "bg-warning-100 text-warning-500";
      case "danger":
        return "bg-danger-100 text-danger-500";
      case "secondary":
        return "bg-secondary-100 text-secondary-500";
      default:
        return "bg-default-100 text-default-500";
    }
  };

  // Return locked style if award is not unlocked
  const getAwardStyle = (award: (typeof awards)[0]) => {
    if (!award.unlocked) {
      return "bg-default-100 text-default-400 opacity-60";
    }
    return getBgColor(award.color, award.received);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Community Awards</h1>
          <p className="text-default-500">
            Recognize and celebrate contributions to your local community
          </p>
        </div>
        <Chip color="primary" variant="flat" className="px-3">
          Preview Feature
        </Chip>
      </div>

      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        variant="underlined"
        className="mb-6"
        size="lg"
      >
        <Tab key="my-awards" title="My Awards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {awards
              .filter((award) => award.received)
              .map((award) => (
                <Card key={award.id} className="border border-divider">
                  <CardHeader className="flex gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${getAwardStyle(award)}`}
                    >
                      {award.emoji}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-lg font-semibold">{award.name}</p>
                      <p className="text-small text-default-500">
                        Received {award.count}{" "}
                        {award.count === 1 ? "time" : "times"}
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <p className="text-default-700">{award.description}</p>
                  </CardBody>
                  <CardFooter className="flex justify-end">
                    <Button color="primary" variant="flat" size="sm">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Recent Award Activity
            </h2>
            <Card className="border border-divider">
              <CardBody className="p-0">
                <ul className="divide-y divide-divider">
                  {awardActivity.map((activity) => (
                    <li key={activity.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${getBgColor(activity.color, true)}`}
                        >
                          {activity.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {activity.awardName} Award
                            </span>
                            <span className="text-default-400 text-xs">
                              • {activity.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-default-600 mb-2">
                            {activity.note}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-default-500">
                              From:
                            </span>
                            <Avatar
                              size="sm"
                              src={activity.fromUser.image}
                              name={activity.fromUser.name}
                            />
                            <span className="text-xs font-medium">
                              {activity.fromUser.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="all-awards" title="All Awards">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {awards.map((award) => (
              <div
                key={award.id}
                className="border border-divider rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${getAwardStyle(award)}`}
                  >
                    {award.emoji}
                  </div>
                  <div>
                    <h3 className="font-semibold">{award.name}</h3>
                    {!award.unlocked && (
                      <Badge color="default" variant="flat" size="sm">
                        Locked
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-default-600 mb-3">
                  {award.description}
                </p>
                <div className="flex justify-between items-center">
                  {award.received ? (
                    <Chip size="sm" color="success" variant="flat">
                      Earned
                    </Chip>
                  ) : award.unlocked ? (
                    <Chip size="sm" color="default" variant="flat">
                      Not Earned
                    </Chip>
                  ) : (
                    <Chip size="sm" color="default" variant="flat">
                      Locked
                    </Chip>
                  )}
                  <span className="text-xs text-default-500">
                    {award.received
                      ? `Received ${award.count} ${award.count === 1 ? "time" : "times"}`
                      : award.unlocked
                        ? "Available to earn"
                        : "Complete criteria to unlock"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Tab>

        <Tab key="give-award" title="Give an Award">
          <Card className="border border-divider mb-8">
            <CardBody>
              <h2 className="text-xl font-semibold mb-4">
                Recognize a Community Member
              </h2>
              <p className="mb-6 text-default-600">
                Show appreciation to others who have made positive contributions
                to your community by giving them an award.
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Select a Member
                  </label>
                  <input
                    type="text"
                    placeholder="Search for a community member..."
                    className="w-full px-3 py-2 rounded-lg border border-divider bg-background focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Choose an Award
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                    {awards
                      .filter((a) => a.unlocked)
                      .map((award) => (
                        <button
                          key={award.id}
                          className={`p-2 rounded-lg border ${award.id === "helpful" ? "border-primary bg-primary-50" : "border-divider"} flex flex-col items-center gap-1`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${getBgColor(award.color, true)}`}
                          >
                            {award.emoji}
                          </div>
                          <span className="text-xs font-medium">
                            {award.name}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Add a Note (Optional)
                  </label>
                  <textarea
                    placeholder="Tell them why you're giving this award..."
                    className="w-full px-3 py-2 rounded-lg border border-divider bg-background focus:outline-none focus:ring-2 focus:ring-primary-200 min-h-[100px] resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end mt-2">
                  <Button color="primary">Give Award</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}

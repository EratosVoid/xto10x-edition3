"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Tabs, Tab } from "@heroui/tabs";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [locality, setLocality] = useState("");
  const [stats, setStats] = useState({
    posts: 0,
    events: 0,
    discussions: 0,
    points: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      setLocality((session?.user as any).locality || "Your Community");
      // In a real app, fetch user stats here
      setStats({
        posts: 5,
        events: 2,
        discussions: 10,
        points: 120,
      });
      setIsLoading(false);
    }
  }, [status, router, session]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-xl p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {session?.user?.name}!
            </h1>
            <p className="text-lg opacity-90 mb-4">
              See what&apos;s happening in {locality} today.
            </p>
            <Button
              color="secondary"
              variant="flat"
              className="mt-4"
              onClick={() => router.push("/events/create")}
            >
              Create New Event
            </Button>
          </div>
          <div className="mt-8 md:mt-0 grid grid-cols-2 gap-4">
            <Card className="bg-white/20 backdrop-blur-lg border-none shadow-md">
              <CardBody className="p-4">
                <p className="text-4xl font-bold">{stats.posts}</p>
                <p className="text-sm">Posts</p>
              </CardBody>
            </Card>
            <Card className="bg-white/20 backdrop-blur-lg border-none shadow-md">
              <CardBody className="p-4">
                <p className="text-4xl font-bold">{stats.events}</p>
                <p className="text-sm">Events</p>
              </CardBody>
            </Card>
            <Card className="bg-white/20 backdrop-blur-lg border-none shadow-md">
              <CardBody className="p-4">
                <p className="text-4xl font-bold">{stats.discussions}</p>
                <p className="text-sm">Discussions</p>
              </CardBody>
            </Card>
            <Card className="bg-white/20 backdrop-blur-lg border-none shadow-md">
              <CardBody className="p-4">
                <p className="text-4xl font-bold">{stats.points}</p>
                <p className="text-sm">Points</p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Community Activity Section */}
      <div className="my-8">
        <Tabs
          aria-label="Community Activity"
          color="primary"
          variant="underlined"
          classNames={{
            tabList: "gap-6",
            cursor: "w-full",
            tab: "max-w-fit px-2 h-12",
          }}
        >
          <Tab
            key="upcoming"
            title={
              <div className="flex items-center space-x-2">
                <span>Upcoming Events</span>
                <Chip size="sm" color="primary">
                  3
                </Chip>
              </div>
            }
          >
            <Card className="mt-4">
              <CardBody>
                <p className="text-center text-default-500">
                  No upcoming events in your community yet.
                </p>
                <div className="flex justify-center mt-4">
                  <Button
                    color="primary"
                    onClick={() => router.push("/events/create")}
                  >
                    Create an Event
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Tab>
          <Tab
            key="recent"
            title={
              <div className="flex items-center space-x-2">
                <span>Recent Posts</span>
                <Chip size="sm" color="primary">
                  5
                </Chip>
              </div>
            }
          >
            <Card className="mt-4">
              <CardBody>
                <p className="text-center text-default-500">
                  No recent posts in your community yet.
                </p>
                <div className="flex justify-center mt-4">
                  <Button
                    color="primary"
                    onClick={() => router.push("/posts/create")}
                  >
                    Create a Post
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Tab>
          <Tab
            key="polls"
            title={
              <div className="flex items-center space-x-2">
                <span>Active Polls</span>
                <Chip size="sm" color="primary">
                  2
                </Chip>
              </div>
            }
          >
            <Card className="mt-4">
              <CardBody>
                <p className="text-center text-default-500">
                  No active polls in your community yet.
                </p>
                <div className="flex justify-center mt-4">
                  <Button
                    color="primary"
                    onClick={() => router.push("/polls/create")}
                  >
                    Create a Poll
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="p-6">
              <h3 className="text-xl font-semibold mb-2">Create Post</h3>
              <p className="text-default-500 mb-4">
                Share news, updates, or ideas with your community.
              </p>
              <Button
                color="primary"
                variant="flat"
                className="w-full"
                onClick={() => router.push("/posts/create")}
              >
                Start Writing
              </Button>
            </CardBody>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="p-6">
              <h3 className="text-xl font-semibold mb-2">Start Petition</h3>
              <p className="text-default-500 mb-4">
                Create a petition to gather support for local changes.
              </p>
              <Button
                color="primary"
                variant="flat"
                className="w-full"
                onClick={() => router.push("/petitions/create")}
              >
                Create Petition
              </Button>
            </CardBody>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="p-6">
              <h3 className="text-xl font-semibold mb-2">Ask AI</h3>
              <p className="text-default-500 mb-4">
                Get answers about community initiatives and local policies.
              </p>
              <Button
                color="primary"
                variant="flat"
                className="w-full"
                onClick={() => router.push("/ask-ai")}
              >
                Ask Question
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

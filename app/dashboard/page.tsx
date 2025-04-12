"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Badge } from "@heroui/badge";

// Calendar Icon
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z"
      clipRule="evenodd"
    />
  </svg>
);

// Notification Icon
const NotificationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z"
      clipRule="evenodd"
    />
  </svg>
);

// Announcement Icon
const AnnouncementIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M16.881 4.346A23.112 23.112 0 018.25 6H7.5a5.25 5.25 0 00-.88 10.427 21.593 21.593 0 001.378 3.94c.464 1.004 1.674 1.32 2.582.796l.657-.379c.88-.508 1.165-1.592.772-2.468a17.116 17.116 0 01-.628-1.607c1.918.258 3.76.75 5.5 1.446A21.727 21.727 0 0018 11.25c0-2.413-.393-4.735-1.119-6.904zM18.26 3.74a23.22 23.22 0 011.24 7.51 23.22 23.22 0 01-1.24 7.51c-.055.161-.111.322-.17.482a.75.75 0 101.409.516 24.555 24.555 0 001.415-6.43 2.992 2.992 0 00.836-2.078c0-.806-.319-1.54-.836-2.078a24.65 24.65 0 00-1.415-6.43.75.75 0 10-1.409.516c.059.16.116.321.17.483z" />
  </svg>
);

// Petition Icon
const PetitionIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zM6 12a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V12zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 15a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V15zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 18a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V18zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);

// Sparkles (AI) Icon
const SparklesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z"
      clipRule="evenodd"
    />
  </svg>
);

// Format date
const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

// Format time
const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

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
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [petitions, setPetitions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [error, setError] = useState("");

  // Fetch all data needed for the dashboard
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Fetch events data
      const eventsResponse = await fetch("/api/events?upcoming=true&limit=5");
      if (!eventsResponse.ok) {
        throw new Error(`Failed to fetch events: ${eventsResponse.statusText}`);
      }
      const eventsData = await eventsResponse.json();
      setUpcomingEvents(
        eventsData.events.map((event: any) => ({
          ...event,
          date: new Date(event.startDate),
          participants: event.attendees?.length || 0,
        }))
      );

      // Fetch notifications
      const notificationsResponse = await fetch("/api/notifications");
      if (!notificationsResponse.ok) {
        throw new Error(
          `Failed to fetch notifications: ${notificationsResponse.statusText}`
        );
      }
      const notificationsData = await notificationsResponse.json();
      setNotifications(
        notificationsData.notifications.map((notification: any) => ({
          id: notification._id,
          message: notification.message,
          read: notification.isRead,
          time: formatTimeAgo(new Date(notification.createdAt)),
          type: notification.type || "general",
        }))
      );

      // Fetch petitions
      const petitionsResponse = await fetch("/api/posts?type=petition&limit=3");
      if (!petitionsResponse.ok) {
        throw new Error(
          `Failed to fetch petitions: ${petitionsResponse.statusText}`
        );
      }
      const petitionsData = await petitionsResponse.json();
      const petitionsWithDetails = petitionsData.posts.map((post: any) => ({
        id: post._id,
        title: post.title,
        content: post.description,
        date: new Date(post.createdAt),
        signatures: post.petitionId?.signatures || 0,
        goal: post.petitionId?.goal || 100,
      }));
      setPetitions(petitionsWithDetails);

      // Fetch announcements
      const announcementsResponse = await fetch(
        "/api/posts?type=announcement&limit=3"
      );
      if (!announcementsResponse.ok) {
        throw new Error(
          `Failed to fetch announcements: ${announcementsResponse.statusText}`
        );
      }
      const announcementsData = await announcementsResponse.json();
      const formattedAnnouncements = announcementsData.posts.map(
        (post: any) => ({
          id: post._id,
          title: post.title,
          content: post.description,
          date: formatTimeAgo(new Date(post.createdAt)),
          author: post.createdBy?.name || "Community Admin",
        })
      );
      setAnnouncements(formattedAnnouncements);

      // Fetch user stats
      const statsResponse = await fetch("/api/user/stats");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          posts: statsData.posts || 0,
          events: statsData.events || 0,
          discussions: statsData.discussions || 0,
          points: statsData.points || 0,
        });
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  // Format time ago (e.g., "2 hours ago", "3 days ago")
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60)
      return `${diffInSeconds} second${diffInSeconds === 1 ? "" : "s"} ago`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30)
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      setLocality((session?.user as any).locality || "Your Community");
      // Fetch all dashboard data
      fetchDashboardData();
    }
  }, [status, router, session]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full md:h-screen grid grid-cols-1 md:grid-rows-3 md:grid-cols-3 py-8 px-4 sm:px-6 gap-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-xl p-8 text-white md:col-span-3">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {session?.user?.name}!
            </h1>
            <p className="text-lg opacity-90 mb-4">
              See what&apos;s happening in {locality} today.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button
                className="bg-foreground-50"
                color="secondary"
                variant="flat"
                onPress={() => router.push("/posts/create?type=general")}
              >
                Make a Post
              </Button>
              <Button
                className="bg-foreground-50"
                color="secondary"
                variant="flat"
                onPress={() => router.push("/posts/create?type=event")}
              >
                Create Event
              </Button>
              <Button
                className="bg-foreground-50"
                color="secondary"
                variant="flat"
                startContent={<SparklesIcon />}
                onPress={() => router.push("/ask-ai")}
              >
                Ask AI
              </Button>
            </div>
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

      {/* Error Message - Show if there's an error */}
      {error && (
        <div className="md:col-span-3 bg-danger-50 text-danger border border-danger-200 p-4 rounded-lg">
          <p className="font-medium">{error}</p>
          <Button
            variant="flat"
            color="danger"
            size="sm"
            className="mt-2"
            onPress={() => fetchDashboardData()}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Main Content */}
      {/* Calendar Events (Spans 2 columns on md screens) */}
      <Card className="row-span-2 row-start-2">
        <CardHeader className="flex items-center gap-2">
          <CalendarIcon />
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div
                  key={event.id || event._id}
                  className="flex items-start gap-4 pb-4 border-b last:border-0"
                >
                  <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex flex-col items-center justify-center text-primary-600">
                    <span className="text-xs font-medium">
                      {formatDate(event.date).split(",")[0]}
                    </span>
                    <span className="text-lg font-bold">
                      {event.date.getDate()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm mt-1">
                      <span className="text-default-600">
                        {formatTime(event.date)}
                      </span>
                      <span className="text-default-600">{event.location}</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={() =>
                          router.push(`/posts/${event?.postId?._id}`)
                        }
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-default-500 py-6">
                No upcoming events in your community yet.
              </p>
            )}
          </div>
        </CardBody>
        <CardFooter>
          <Button
            color="primary"
            variant="flat"
            onClick={() => router.push("/posts/create?type=event")}
          >
            Create Event
          </Button>
        </CardFooter>
      </Card>

      {/* Notifications */}
      <Card className="col-span-1">
        <CardHeader className="flex items-center gap-2">
          <NotificationIcon />
          <h2 className="text-xl font-semibold">Notifications</h2>
          <Badge color="danger" size="sm" className="ml-auto">
            {notifications.filter((n) => !n.read).length}
          </Badge>
          <Button
            variant="light"
            size="sm"
            className="w-fit ml-auto"
            onPress={() => router.push("/notifications")}
          >
            View All
          </Button>
        </CardHeader>
        <CardBody className="p-0 scrollbar-hide">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id || notification._id}
                className={`p-4 border-b last:border-0 ${
                  notification.read
                    ? ""
                    : "bg-primary-50 dark:bg-primary-900/10"
                }`}
              >
                <div className="flex gap-2 items-start">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${notification.read ? "bg-default-200" : "bg-danger-500"}`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm mb-1">{notification.message}</p>
                    <p className="text-xs text-default-400">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-default-500">
              No notifications yet
            </div>
          )}
        </CardBody>
      </Card>

      {/* Trending Petitions */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <PetitionIcon />
          <h2 className="text-xl font-semibold">Trending Petitions</h2>
        </CardHeader>
        <CardBody className="scrollbar-hide">
          <div className="space-y-4">
            {petitions.length > 0 ? (
              petitions.map((petition) => (
                <div
                  key={petition.id || petition._id}
                  className="flex items-start gap-4 pb-4 border-b last:border-0"
                >
                  <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex flex-col items-center justify-center text-primary-600">
                    <span className="text-xs font-medium">
                      {formatDate(petition.date).split(",")[0]}
                    </span>
                    <span className="text-lg font-bold">
                      {petition.date.getDate()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{petition.title}</h3>
                    <p className="text-sm text-default-600 mb-2 line-clamp-2">
                      {petition.content}
                    </p>
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="h-1.5 w-full bg-gray-200 rounded-full">
                          <div
                            className="h-1.5 bg-primary rounded-full"
                            style={{
                              width: `${Math.min(Math.round((petition.signatures / petition.goal) * 100), 100)}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs mt-1 text-default-500">
                          {petition.signatures} of {petition.goal} signatures
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        className="ml-2"
                        onPress={() =>
                          router.push(`/posts/${petition.id || petition._id}`)
                        }
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-default-500 py-6">
                No active petitions at the moment
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Recent Announcements */}
      <Card className="md:col-span-2">
        <CardHeader className="flex items-center gap-2">
          <AnnouncementIcon />
          <h2 className="text-xl font-semibold">Recent Announcements</h2>
          <Button
            color="primary"
            variant="flat"
            size="sm"
            className="ml-auto"
            onPress={() => router.push("/posts?type=announcement")}
          >
            View All
          </Button>
        </CardHeader>
        <CardBody className="scrollbar-hide">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div
                key={announcement.id || announcement._id}
                className="mb-4 pb-4 border-b last:border-0 last:pb-0 last:mb-0"
              >
                <h3 className="text-lg font-semibold mb-1">
                  {announcement.title}
                </h3>
                <p className="text-sm text-default-600 mb-2 line-clamp-3">
                  {announcement.content}
                </p>
                <div className="flex items-center text-xs text-default-400">
                  <span>By {announcement.author}</span>
                  <span className="mx-2">•</span>
                  <span>{announcement.date}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-default-500 py-6">
              No announcements yet
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

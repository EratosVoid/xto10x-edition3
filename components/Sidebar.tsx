"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import NextLink from "next/link";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";
import { siteConfig } from "@/config/site";

// Heroicon - Home
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
  </svg>
);

// Heroicon - Users
const CommunityIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
      clipRule="evenodd"
    />
    <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
  </svg>
);

// Heroicon - Chat Bubble Left Right
const DiscussionsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
    <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
  </svg>
);

// Heroicon - Calendar
export const EventsIcon = () => (
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

// Heroicon - Chart Bar
export const PollsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
  </svg>
);

// Heroicon - Megaphone
export const PetitionsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M16.881 4.346A23.112 23.112 0 018.25 6H7.5a5.25 5.25 0 00-.88 10.427 21.593 21.593 0 001.378 3.94c.464 1.004 1.674 1.32 2.582.796l.657-.379c.88-.508 1.165-1.592.772-2.468a17.116 17.116 0 01-.628-1.607c1.918.258 3.76.75 5.5 1.446A21.727 21.727 0 0018 11.25c0-2.413-.393-4.735-1.119-6.904zM18.26 3.74a23.22 23.22 0 011.24 7.51 23.22 23.22 0 01-1.24 7.51c-.055.161-.111.322-.17.482a.75.75 0 101.409.516 24.555 24.555 0 001.415-6.43 2.992 2.992 0 00.836-2.078c0-.806-.319-1.54-.836-2.078a24.65 24.65 0 00-1.415-6.43.75.75 0 10-1.409.516c.059.16.116.321.17.483z" />
  </svg>
);

// Heroicon - Squares 2x2 (Dashboard)
const DashboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z"
      clipRule="evenodd"
    />
  </svg>
);

// Heroicon - Trophy (Awards)
const AwardsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z"
      clipRule="evenodd"
    />
  </svg>
);

// Heroicon - Star (Leaderboard)
const LeaderboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
      clipRule="evenodd"
    />
  </svg>
);

// Heroicon - Sparkles (AI Assistant)
const AiAssistantIcon = () => (
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

// Map navigation items to icons
const getNavIcon = (label: string) => {
  switch (label) {
    case "Home":
      return <HomeIcon />;
    case "Ask AI":
      return <AiAssistantIcon />;
    case "Dashboard":
      return <DashboardIcon />;
    case "Posts":
      return <CommunityIcon />;
    case "Discussions":
      return <DiscussionsIcon />;
    case "Events":
      return <EventsIcon />;
    case "Polls":
      return <PollsIcon />;
    case "Petitions":
      return <PetitionsIcon />;
    case "Awards":
      return <AwardsIcon />;
    case "Leaderboard":
      return <LeaderboardIcon />;

    default:
      return null;
  }
};

export const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [expanded, setExpanded] = useState(true);

  const handleSignOut = async () => {
    sessionStorage.clear();
    localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    await signOut({ redirect: true });
    router.push("/");
  };

  return (
    <div className="flex flex-col h-fit md:h-screen">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b ">
        <NextLink href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-bold">LocalVoice</span>
        </NextLink>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-full hover:bg-default-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar container */}
      <div
        className={`
        ${expanded ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
        fixed inset-y-0 left-0 z-30 w-64 transition-transform duration-300 ease-in-out
        bg-background border-r border-divider shadow-sm flex flex-col
        md:static h-full
      `}
      >
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-between">
          <NextLink href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-bold">LocalVoice</span>
          </NextLink>
          <ThemeSwitch />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {siteConfig.navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname?.startsWith(`${item.href}/`) && item.href !== "/");
              return (
                <li key={item.href}>
                  <NextLink
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group
                      ${
                        isActive
                          ? "bg-primary-100 text-primary-600 dark:bg-primary-700/20 dark:text-primary-400"
                          : "text-default-600 hover:text-primary hover:bg-default-100"
                      }`}
                  >
                    <span
                      className={`${isActive ? "text-primary-500" : "text-default-400"} group-hover:text-primary transition-colors`}
                    >
                      {getNavIcon(item.label)}
                    </span>
                    <span>{item.label}</span>
                    {item.preview && (
                      <Chip
                        color="primary"
                        size="sm"
                        variant="flat"
                        className="ml-auto py-0 px-1.5 h-auto text-xs font-medium"
                      >
                        Preview
                      </Chip>
                    )}
                    {item.highlight && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-primary"></span>
                    )}
                  </NextLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Controls */}
        <div className="p-4 border-t mt-auto">
          {/* Mobile Close Button - Moved to its own row */}
          <button
            onClick={() => setExpanded(false)}
            className="md:hidden p-2 rounded-full hover:bg-default-100 mb-4 ml-auto block"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-default-50 mb-3">
                <div className="relative">
                  {session?.user?.image ? (
                    <Avatar
                      isBordered
                      color="primary"
                      name={session?.user?.name || "User"}
                      size="sm"
                      src={session?.user?.image}
                      className="bg-primary-100"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary-300 to-secondary-300 flex items-center justify-center text-white font-medium text-sm border-2 border-primary">
                      {(
                        session?.user?.name?.substring(0, 2) || "U"
                      ).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success-500 rounded-full border-2 border-white dark:border-background"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-default-500 truncate">
                    {session?.user?.email}
                  </p>
                </div>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>

              {/* User Awards Preview */}
              <div className="mb-3 p-2 border border-divider rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <AwardsIcon />
                    <span className="text-xs font-medium">My Awards</span>
                  </div>
                  <NextLink href="/awards" className="text-xs text-primary">
                    View All
                  </NextLink>
                </div>
                <div className="flex gap-1">
                  <div className="w-6 h-6 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center text-xs">
                    🏆
                  </div>
                  <div className="w-6 h-6 bg-success-100 text-success-500 rounded-full flex items-center justify-center text-xs">
                    🌱
                  </div>
                  <div className="w-6 h-6 bg-warning-100 text-warning-500 rounded-full flex items-center justify-center text-xs">
                    ⭐
                  </div>
                  <div className="w-6 h-6 bg-default-100 text-default-500 rounded-full flex items-center justify-center text-xs">
                    +2
                  </div>
                </div>
              </div>

              {/* User Leaderboard Position */}
              <div className="mb-3 p-2 border border-divider rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <LeaderboardIcon />
                    <span className="text-xs font-medium">My Ranking</span>
                  </div>
                  <NextLink
                    href="/leaderboard"
                    className="text-xs text-primary"
                  >
                    View Board
                  </NextLink>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                    5
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-full bg-default-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: "65%" }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-2 text-xs font-medium text-success-600">
                    485 pts
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                as={NextLink}
                color="primary"
                href="/login"
                variant="flat"
                fullWidth
              >
                Sign In
              </Button>
              <Button as={NextLink} color="primary" href="/register" fullWidth>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {expanded && (
        <div
          className="md:hidden fixed inset-0 bg-foreground/20 z-20"
          onClick={() => setExpanded(false)}
        />
      )}
    </div>
  );
};

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "LocalVoice",
  description: "Building stronger communities together.",
  navItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Ask AI",
      href: "/ask-ai",
      highlight: true,
    },
    {
      label: "Petitions",
      href: "/petitions",
    },
    {
      label: "Posts",
      href: "/posts",
    },
    {
      label: "Events",
      href: "/events",
    },
    {
      label: "Polls",
      href: "/polls",
    },

    {
      label: "Discussions",
      href: "/discussions",
      preview: true,
    },

    {
      label: "Awards",
      href: "/awards",
      preview: true,
    },
    {
      label: "Leaderboard",
      href: "/leaderboard",
      preview: true,
    },
  ],
  navMenuItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Posts",
      href: "/posts",
    },
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "My Community",
      href: "/community",
    },
    {
      label: "My Posts",
      href: "/my-posts",
    },
    {
      label: "My Events",
      href: "/my-events",
    },
    {
      label: "Notifications",
      href: "/notifications",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & FAQ",
      href: "/help",
    },
    {
      label: "Logout",
      href: "/api/auth/signout",
    },
  ],
  links: {
    github: "https://github.com/yourusername/localvoice",
    twitter: "https://twitter.com/localvoice",
    discord: "https://discord.gg/localvoice",
  },
};

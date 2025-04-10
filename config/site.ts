export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "LocalVoice",
  description: "Building stronger communities together.",
  navItems: [
    {
      label: "Home",
      href: "/",
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
      label: "Petitions",
      href: "/petitions",
    },
    {
      label: "Discussions",
      href: "/discussions",
    },
  ],
  navMenuItems: [
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

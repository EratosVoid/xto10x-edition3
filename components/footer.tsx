import { Link } from "@heroui/link";
import { Divider } from "@heroui/divider";

import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="w-full py-8 px-6 bg-content1 mt-32">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">LokNiti</h3>
            <p className="text-default-500">
              Building stronger communities together, one voice at a time.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Features</h3>
            <Link href="/events">Community Events</Link>
            <Link href="/polls">Local Polls</Link>
            <Link href="/petitions">Petitions</Link>
            <Link href="/discussions">Discussions</Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Get Started</h3>
            <Link href="/login">Sign In</Link>
            <Link href="/register">Sign Up</Link>
            <Link href="/help">Help & FAQ</Link>
            <Link href="/localities">Localities</Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Legal</h3>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/cookie">Cookie Policy</Link>
          </div>
        </div>

        <Divider className="my-6" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-default-500 text-sm">
            © {new Date().getFullYear()} LokNiti. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            {Object.entries(siteConfig.links).map(([key, url]) => (
              <Link
                key={key}
                isExternal
                className="text-default-500 hover:text-primary"
                href={url}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useEffect, useState } from "react";

export const PWAStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [swError, setSwError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Set initial online status
      setIsOnline(navigator.onLine);

      // Check if iOS
      const ios = /iphone|ipad|ipod/.test(
        window.navigator.userAgent.toLowerCase()
      );
      setIsIOS(ios);

      // Check if already installed (in standalone mode)
      setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

      // Add event listeners for connection changes
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Listen for service worker errors
      window.addEventListener("error", (event) => {
        if (event.message && event.message.includes("service worker")) {
          setSwError(event.message);
          console.error("Service Worker error detected:", event);
        }
      });

      // Check if service worker is supported and ready
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.catch((error) => {
          console.error("Service worker ready failed:", error);
          // Don't display error to user
        });
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    } catch (error) {
      console.error("Error in PWAStatus component:", error);
      // If there's an error, assume we're online to prevent blocking the UI
      setIsOnline(true);
    }
  }, []);

  // Show service worker error (only in development)
  if (swError && process.env.NODE_ENV === "development") {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-yellow-600 text-white p-2 text-center z-50">
        Service worker error. Check console.
      </div>
    );
  }

  // Only show offline message when offline
  if (!isOnline) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-2 text-center z-50">
        You are currently offline. Some features may be unavailable.
      </div>
    );
  }

  // Only show install prompt for iOS and not already installed
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-3 text-center z-50">
        Install this app on your device by tapping
        <span className="mx-1 font-bold">Share</span>
        <span role="img" aria-label="share icon" className="mx-1">
          ⎋
        </span>
        and then
        <span className="mx-1 font-bold">Add to Home Screen</span>
        <span role="img" aria-label="plus icon" className="mx-1">
          ➕
        </span>
      </div>
    );
  }

  // Return null if online and not showing install prompt
  return null;
};

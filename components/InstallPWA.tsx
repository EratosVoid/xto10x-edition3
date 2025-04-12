"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";

export default function InstallPWA() {
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Check if the installPWA function is available (set by register-sw.js)
    const checkInstallable = () => {
      if (typeof window !== "undefined" && "installPWA" in window) {
        setIsInstallable(true);
      }
    };

    // Check initially
    checkInstallable();

    // Set up an interval to check periodically
    const intervalId = setInterval(checkInstallable, 2000);

    // Clear on unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleInstall = () => {
    if (typeof window !== "undefined" && "installPWA" in window) {
      // Call the global installPWA function that was set in register-sw.js
      (window as any).installPWA();
    }
  };

  if (!isInstallable) {
    return null;
  }

  return (
    <Button
      color="primary"
      variant="flat"
      onClick={handleInstall}
      startContent={
        <img
          src="/images/icon-192x192.png"
          alt="LokNiti"
          style={{ width: "24px", height: "24px", objectFit: "contain" }}
        />
      }
    >
      Install App
    </Button>
  );
}

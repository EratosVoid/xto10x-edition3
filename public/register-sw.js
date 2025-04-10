// Register service worker for offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    // Check for any manifest issues
    fetch("/manifest.json")
      .then((response) => {
        if (!response.ok) {
          console.error("Manifest fetch failed, clearing caches");
          clearCaches();
        }
      })
      .catch((error) => {
        console.error("Error fetching manifest:", error);
      });

    // Clear caches if needed, for debugging purposes
    const clearCaches = async () => {
      if (window.caches) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
          console.log("All caches cleared");
        } catch (error) {
          console.error("Error clearing caches:", error);
        }
      }
    };

    // Register the service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then(function (registration) {
        console.log(
          "Service Worker registered successfully with scope: ",
          registration.scope
        );
      })
      .catch(function (error) {
        console.log("Service Worker registration failed: ", error);
      });
  });
}

// Add event listeners to display offline/online status
window.addEventListener("online", function () {
  document.dispatchEvent(
    new CustomEvent("connectionChange", { detail: { online: true } })
  );
});

window.addEventListener("offline", function () {
  document.dispatchEvent(
    new CustomEvent("connectionChange", { detail: { online: false } })
  );
});

// Helper function to check if device is currently online
function isOnline() {
  return navigator.onLine;
}

// Export for use in React components
if (typeof window !== "undefined") {
  window.isOnline = isOnline;
}

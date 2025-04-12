// Register service worker for offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
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

// Add code to detect PWA install prompt
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Update UI to notify the user they can install the PWA
  // This is a simple approach - you can add a button or other UI if needed
  console.log("PWA is installable");

  // Make the prompt available to the app
  window.installPWA = () => {
    if (!deferredPrompt) {
      console.log("No installation prompt available");
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the installation");
      } else {
        console.log("User dismissed the installation");
      }
      // We no longer need the prompt, clear it
      deferredPrompt = null;
    });
  };
});

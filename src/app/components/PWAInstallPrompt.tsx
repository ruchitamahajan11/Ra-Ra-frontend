import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    const ios =
      /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    if (ios && !isStandalone) {
      setIsIOS(true);
      const seen = localStorage.getItem("pwa-ios-tip-seen");
      if (!seen) {
        setTimeout(() => setShowIOSTip(true), 3000);
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("PWA installed!");
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const dismissBanner = () => setShowBanner(false);

  const dismissIOSTip = () => {
    setShowIOSTip(false);
    localStorage.setItem("pwa-ios-tip-seen", "true");
  };

  // Android / Chrome install banner
  if (showBanner) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-xl p-4 text-white shadow-xl" style={{ background: '#0c1e3d' }}>
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Install App</p>
            <p className="text-xs opacity-80">Add to home screen for offline access</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="rounded-lg bg-white text-[#0c1e3d] text-xs font-semibold px-3 py-1.5 active:opacity-80"
          >
            Install
          </button>
          <button
            onClick={dismissBanner}
            className="rounded-full p-1 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // iOS Safari tip banner
  if (isIOS && showIOSTip) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 rounded-xl p-4 text-white shadow-xl" style={{ background: '#0c1e3d' }}>
        <button
          onClick={dismissIOSTip}
          className="absolute top-2 right-2 rounded-full p-1 hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold mb-1">📲 Add to Home Screen</p>
        <p className="text-xs opacity-90 leading-relaxed">
          Tap the <strong>Share</strong> button (□↑) in Safari, then tap{" "}
          <strong>"Add to Home Screen"</strong> to install the app.
        </p>
      </div>
    );
  }

  return null;
}
import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Sparkles } from "lucide-react";

const InstallPwaBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed / standalone mode
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem("pwa_install_dismissed");
    if (dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000) {
      // dismissed in last 24h
      return;
    }

    // Detect iOS
    const isIosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIosDevice) {
      setIsIOS(true);
      setShowBanner(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_install_dismissed", Date.now().toString());
    setShowBanner(false);
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white rounded-2xl p-3.5 sm:p-4 shadow-lg shadow-indigo-500/15 border border-indigo-400/30 mb-5 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0 text-white shadow-inner">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold truncate flex items-center gap-1.5">
              <span>મોબાઇલમાં એપ ઇન્સ્ટોલ કરો</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-300 flex-shrink-0" />
            </h4>
            <p className="text-[11px] sm:text-xs text-indigo-100 truncate">
              {isIOS
                ? "Safari માં શેર (Share) દબાવી 'Add to Home Screen' કરો"
                : "હોમ સ્ક્રીન પરથી સુપર-ફાસ્ટ એક્સેસ માટે ડાઉનલોડ કરો"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!isIOS && deferredPrompt && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white hover:bg-slate-50 active:bg-slate-100 text-indigo-700 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>ઇન્સ્ટોલ</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 text-indigo-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPwaBanner;

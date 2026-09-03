"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "iqamah_install_banner_dismissed";

export default function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const dismissed = localStorage.getItem(DISMISS_KEY) === "1";

    if (isIOS && !isStandalone && !dismissed) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="mx-4 mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
      <p className="font-medium mb-1">📲 Install Iqamah first</p>
      <p className="mb-2">
        Tap <span className="font-medium">Share</span> →{" "}
        <span className="font-medium">Add to Home Screen</span> now, then reopen
        Iqamah from your home screen before saving or scanning masjids. On iOS,
        the installed app keeps a separate list from Safari, so masjids saved
        here won&apos;t show up there.
      </p>
      <button
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, "1");
          setShow(false);
        }}
        className="text-amber-700 font-medium underline"
      >
        Got it
      </button>
    </div>
  );
}

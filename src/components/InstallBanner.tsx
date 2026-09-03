"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const DISMISS_KEY = "iqamah_install_banner_dismissed";

export default function InstallBanner() {
  const { t } = useLanguage();
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
      <p className="font-medium mb-1">{t.install.title}</p>
      <p className="mb-2">{t.install.body}</p>
      <button
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, "1");
          setShow(false);
        }}
        className="text-amber-700 font-medium underline"
      >
        {t.install.gotIt}
      </button>
    </div>
  );
}

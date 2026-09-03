"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function GetDirectionsLink({ url }: { url: string }) {
  const { t } = useLanguage();
  return (
    <a href={url} target="_blank" className="btn-secondary block mt-3">
      🧭 {t.masjid.getDirections}
    </a>
  );
}

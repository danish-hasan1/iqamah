"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function GetDirectionsLink({ url }: { url: string }) {
  const { t } = useLanguage();
  return (
    <a
      href={url}
      target="_blank"
      className="block text-center mt-2 text-sm text-teal-700 font-medium underline"
    >
      {t.masjid.getDirections}
    </a>
  );
}

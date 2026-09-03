"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/utils";
import type { Masjid, PrayerKey } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const ROWS: PrayerKey[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha", "jumuah"];
const DAILY_ORDER: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const ICON: Record<PrayerKey, string> = {
  fajr: "🌅",
  sunrise: "☀️",
  dhuhr: "🌞",
  asr: "🌤️",
  maghrib: "🌇",
  isha: "🌙",
  jumuah: "🕌",
};

function nextPrayer(masjid: Masjid): PrayerKey | null {
  const nowLocal = new Date().toLocaleTimeString("en-GB", {
    timeZone: masjid.timezone || "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const upcoming = DAILY_ORDER.find((p) => masjid[p] && masjid[p]!.slice(0, 5) > nowLocal);
  return upcoming || DAILY_ORDER.find((p) => masjid[p]) || null;
}

export default function PrayerTimesTable({ masjid }: { masjid: Masjid }) {
  const { t } = useLanguage();
  const [next, setNext] = useState<PrayerKey | null>(null);

  useEffect(() => {
    setNext(nextPrayer(masjid));
    const interval = setInterval(() => setNext(nextPrayer(masjid)), 60_000);
    return () => clearInterval(interval);
  }, [masjid]);

  return (
    <div className="card divide-y divide-teal-100/80 overflow-hidden">
      {ROWS.filter((p) => masjid[p]).map((p) => {
        const isNext = p === next;
        return (
          <div
            key={p}
            className={`flex items-center justify-between px-4 py-3 ${
              isNext ? "bg-teal-50" : ""
            }`}
          >
            <span className="flex items-center gap-2.5 font-medium text-slate-700">
              <span className="text-lg leading-none">{ICON[p]}</span>
              {t.prayer[p]}
              {isNext && (
                <span className="text-[10px] font-semibold uppercase tracking-wide bg-gold-500 text-white rounded-full px-2 py-0.5">
                  {t.masjid.next}
                </span>
              )}
            </span>
            <span
              className={`font-semibold tabular-nums ${
                isNext ? "text-teal-800" : "text-slate-600"
              }`}
            >
              {formatTime(masjid[p])}
            </span>
          </div>
        );
      })}
      {ROWS.every((p) => !masjid[p]) && (
        <p className="text-center text-slate-400 text-sm py-6">{t.masjid.timingsNotSet}</p>
      )}
    </div>
  );
}

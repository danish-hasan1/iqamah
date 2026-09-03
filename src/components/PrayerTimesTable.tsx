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
  // `next` depends on wall-clock time, not just props, so it's computed
  // fresh on every render rather than synced via an effect; the interval
  // below exists only to force a re-render once a minute so it stays current.
  const next = nextPrayer(masjid);
  const [, forceTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceTick((n) => n + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card divide-y divide-teal-100/80 overflow-hidden">
      {ROWS.filter((p) => masjid[p]).map((p) => {
        const isNext = p === next;
        return (
          <div
            key={p}
            className={`flex items-center justify-between gap-3 px-5 py-4 ${
              isNext ? "bg-teal-50" : ""
            }`}
          >
            <span className="flex items-center gap-3 min-w-0">
              <span className="text-3xl leading-none shrink-0">{ICON[p]}</span>
              <span className="flex flex-col min-w-0">
                <span className="text-lg font-semibold text-slate-700 truncate">
                  {t.prayer[p]}
                </span>
                {isNext && (
                  <span className="text-sm font-bold uppercase tracking-wide text-gold-600 w-fit">
                    {t.masjid.next}
                  </span>
                )}
              </span>
            </span>
            <span
              className={`text-2xl font-bold tabular-nums shrink-0 ${
                isNext ? "text-teal-800" : "text-slate-600"
              }`}
            >
              {formatTime(masjid[p])}
            </span>
          </div>
        );
      })}
      {ROWS.every((p) => !masjid[p]) && (
        <p className="text-center text-slate-400 text-base py-6">{t.masjid.timingsNotSet}</p>
      )}
    </div>
  );
}

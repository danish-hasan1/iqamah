"use client";

import { formatTime } from "@/lib/utils";
import type { Masjid, PrayerKey } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const ROWS: PrayerKey[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha", "jumuah"];

export default function PrayerTimesTable({ masjid }: { masjid: Masjid }) {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-xl border border-teal-100 divide-y">
      {ROWS.filter((p) => masjid[p]).map((p) => (
        <div key={p} className="flex items-center justify-between px-4 py-3">
          <span className="font-medium text-slate-700">{t.prayer[p]}</span>
          <span className="text-teal-800 font-semibold tabular-nums">
            {formatTime(masjid[p])}
          </span>
        </div>
      ))}
      {ROWS.every((p) => !masjid[p]) && (
        <p className="text-center text-slate-400 text-sm py-6">{t.masjid.timingsNotSet}</p>
      )}
    </div>
  );
}

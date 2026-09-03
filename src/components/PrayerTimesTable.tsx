import { formatTime } from "@/lib/utils";
import { PRAYER_LABELS, type Masjid, type PrayerKey } from "@/lib/types";

const ROWS: PrayerKey[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha", "jumuah"];

export default function PrayerTimesTable({ masjid }: { masjid: Masjid }) {
  return (
    <div className="bg-white rounded-xl border border-teal-100 divide-y">
      {ROWS.filter((p) => masjid[p]).map((p) => (
        <div key={p} className="flex items-center justify-between px-4 py-3">
          <span className="font-medium text-slate-700">{PRAYER_LABELS[p]}</span>
          <span className="text-teal-800 font-semibold tabular-nums">
            {formatTime(masjid[p])}
          </span>
        </div>
      ))}
      {ROWS.every((p) => !masjid[p]) && (
        <p className="text-center text-slate-400 text-sm py-6">
          Timings not set yet.
        </p>
      )}
    </div>
  );
}
